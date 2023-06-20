export interface QaResult {
  answer: string;
  links: string[];
}

export interface Message {
  id: string;
  content: string; 
  role: 'system' | 'user' | 'assistant';
  links?: string[];
}

export const submitQuestion = async (prompt: string): Promise<QaResult> => {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
    }),
  });
  if (response.ok) {
    const result = await response.json();
    const { code, message, data } = result;
    if (code === 0) {
      return data;
    } else {
      throw new Error(message);
    }
  }

  throw new Error('问答异常');
};
