import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, QaResult, submitQuestion } from '@/services/chat';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<QaResult>();

  useEffect(() => {
    if (result) {
      setMessages([
        ...messages,
        {
          id: uuidv4(),
          role: 'assistant',
          content: result.answer,
          links: result.links,
        },
      ]);
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMessags = [
      ...messages,
      { id: uuidv4(), role: 'user', content: input } as Message,
    ];
    setMessages(newMessags);
    setInput('');

    const res = await submitQuestion(newMessags);
    setResult({
      answer: res.answer,
      links: res.links,
    });
  };

  const renderMessage = (message: Message) => {
    return (
      <div key={message.id}>
        <div>
          {message.role === 'user' ? 'User' : 'AI'}: {message.content}
        </div>
        {message.links && (
          <div>
            参考资料：
            <ol>
              {message.links?.map(x => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.length > 0 ? messages.map(m => renderMessage(m)) : null}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
          value={input}
          placeholder="请输入您的问题..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
