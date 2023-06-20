import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

export interface QaResult {
  answer: string;
  links: string[];
}

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);
  private chain = null;

  constructor(private configService: ConfigService) {
    const model = new ChatOpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0.9,
      maxTokens: 500,
    });

    const prompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `你是一位法律专家，对中国的国家法律特别熟悉，请基于以下资料回答用户的问题。
        如果用户的问题跟法律没有关系，请礼貌地拒绝回答。

        资料：{context}`
      ),
      HumanMessagePromptTemplate.fromTemplate('{question}'),
    ]);
    this.chain = new LLMChain({ llm: model, prompt: prompt });
  }

  async chat(prompt: string): Promise<QaResult> {
    const directory = 'vector-store';
    const loadedVectorStore = await HNSWLib.load(
      directory,
      new OpenAIEmbeddings()
    );
    const links = await loadedVectorStore.similaritySearch(prompt, 2);
    const res = await this.chain.call({
      question: prompt,
      context: links.map(link => link.pageContent).join('\n'),
    });
    return {
      answer: res.text,
      links: links.map(link => link.pageContent),
    };
  }
}
