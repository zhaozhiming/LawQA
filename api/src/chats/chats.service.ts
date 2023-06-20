import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
  PromptTemplate,
} from 'langchain/prompts';

import { LLMChain } from 'langchain/chains';
import { VECTOR_STORE_DIRECTORY } from '../common/constants';

export interface QaResult {
  answer: string;
  links?: string[];
}

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);
  private checkChain = null;
  private chatChain = null;

  constructor(private configService: ConfigService) {
    const checkModel = new OpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0,
      maxTokens: 5,
    });
    const template = `
    Your are a helpful assistant for the expert in Chinese law. 
    Please help me to judge whether the user question is related to the law. 
    If yes, please answer 'Y', if not, please answer 'N'. 
    Just reply one character, do not output additional information.
    user question: {question}`;
    const checkPrompt = new PromptTemplate({
      template: template,
      inputVariables: ['question'],
    });
    this.checkChain = new LLMChain({ llm: checkModel, prompt: checkPrompt });

    const chatModel = new ChatOpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0.9,
      maxTokens: 500,
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `你是一位法律专家，对中国的国家法律特别熟悉，请基于以下资料回答用户的问题。
        如果用户的问题跟法律没有关系，请礼貌地拒绝回答。

        资料：{context}`
      ),
      HumanMessagePromptTemplate.fromTemplate('{question}'),
    ]);
    this.chatChain = new LLMChain({ llm: chatModel, prompt: chatPrompt });
  }

  async checkPrompt(prompt: string): Promise<boolean> {
    const res = await this.checkChain.call({ question: prompt });
    return res.text.includes('Y');
  }

  async chat(prompt: string): Promise<QaResult> {
    const isLawQuestion = await this.checkPrompt(prompt);
    if (!isLawQuestion) {
      return {
        answer: '很抱歉，作为法律专家，我无法回答跟法律无关的问题。',
      };
    }
    const loadedVectorStore = await HNSWLib.load(
      VECTOR_STORE_DIRECTORY,
      new OpenAIEmbeddings()
    );
    const links = await loadedVectorStore.similaritySearch(prompt, 2);
    const res = await this.chatChain.call({
      question: prompt,
      context: links.map(link => link.pageContent).join('\n'),
    });
    return {
      answer: res.text,
      links: links.map(link => link.pageContent),
    };
  }
}
