import * as path from 'path';
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
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema';
import { VECTOR_STORE_DIRECTORY } from '../common/constants';
import { Message, QaResult } from '../data-structure';

const embeddings = new OpenAIEmbeddings();

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);
  private checkChain = null;
  private chatModel = null;

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

    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.CHATGPT_APIKEY,
      temperature: 0.9,
      maxTokens: 500,
    });
  }

  async checkPrompt(prompt: string): Promise<boolean> {
    const res = await this.checkChain.call({ question: prompt });
    return res.text.includes('Y');
  }

  async chat(messages: Message[]): Promise<QaResult> {
    const userPrompt = messages[messages.length - 1];
    const isLawQuestion = await this.checkPrompt(userPrompt.content);
    if (!isLawQuestion) {
      return {
        answer:
          '很抱歉，作为法律专家，我可能无法就与法律无关的话题展开深入的交谈。',
      };
    }
    const loadedVectorStore = await HNSWLib.load(
      VECTOR_STORE_DIRECTORY,
      embeddings
    );
    const links = await loadedVectorStore.similaritySearch(
      userPrompt.content,
      2
    );
    const chatMessages = [
      new SystemChatMessage(`
      You are a valuable assistant to the Chinese law expert. 
      Please provide answers to questions based on the information enclosed within four pound signs (####).
      Always answer questions in Chinese.
      If a user's question has nothing to do with the law, politely decline to answer it.`),
    ];
    chatMessages.push(
      ...messages.slice(0, messages.length - 1).map(x => {
        return x.role === 'user'
          ? new HumanChatMessage(x.content)
          : new AIChatMessage(x.content);
      })
    );
    chatMessages.push(
      new HumanChatMessage(`
      user question: ${userPrompt.content}

      ####information: ${links
        .map(x => {
          const lawName = path.basename(
            x.metadata.source,
            path.extname(x.metadata.source)
          );
          return `${lawName}:${x.pageContent}`;
        })
        .join('\n' + '-'.repeat(20) + '\n')}####
      `)
    );
    const res = await this.chatModel.call(chatMessages);
    return {
      answer: res.text,
      links: links.map(link => link.pageContent),
    };
  }
}
