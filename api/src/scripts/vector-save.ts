import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { TextLoader } from 'langchain/document_loaders/fs/text';

const embeddings = new OpenAIEmbeddings();
const splitter = new CharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 5,
});

const main = async () => {
  const loader = new TextLoader('source-docs/labour-law.txt');
  const file = await loader.load();
  const docs = await splitter.splitDocuments(file);
  console.log({ length: docs.length });

  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
  const directory = 'vector-store';
  await vectorStore.save(directory);

  const loadedVectorStore = await HNSWLib.load(directory, embeddings);
  const result = await loadedVectorStore.similaritySearch('加班超过8小时', 1);
  console.log('result:', result);
};

main();
