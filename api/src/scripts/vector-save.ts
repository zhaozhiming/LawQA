import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { VECTOR_STORE_DIRECTORY } from '../common/constants';

const splitter = new CharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 5,
});

const main = async () => {
  console.log('加载文档...');
  const loader = new TextLoader('source-docs/labour-law.txt');
  const file = await loader.load();
  const docs = await splitter.splitDocuments(file);
  console.log(`分割文档个数：${docs.length}`);

  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
  );
  const directory = VECTOR_STORE_DIRECTORY;
  await vectorStore.save(directory);
  console.log('加载完成');
};

main();
