import { Injectable, Logger } from '@nestjs/common';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
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

  constructor() {
    const checkModel = new ChatOpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0,
      maxTokens: 1,
    });
    const checkPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`
      Your are a helpful assistant for the expert in Chinese law. 
      Please help me to judge whether the user question is related to the law. 
      If yes, please answer 'Y', if not, please answer 'N'. 
      Just reply one character, do not output additional information.`),
      HumanMessagePromptTemplate.fromTemplate('{question}'),
    ]);
    this.checkChain = new LLMChain({ llm: checkModel, prompt: checkPrompt });

    const chatModel = new ChatOpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0.9,
      maxTokens: 500,
    });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`
      Your are a helpful assistant for the expert in Chinese law. 
      Please answer your questions based on the following information.
      Always answer questions in Chinese.
      If a user's question has nothing to do with the law, politely decline to answer it.

      information: {context}`),
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
