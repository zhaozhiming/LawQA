export interface QaResult {
  answer: string;
  links?: string[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}