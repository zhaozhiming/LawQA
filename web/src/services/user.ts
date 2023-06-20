import { fetchTemplate } from './';
import { StoreKeys } from '../common/constants';

export const login = async (
  username: string,
  password: string
): Promise<void> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  if (response.ok) {
    const result = await response.json();
    const { code, message, data } = result;
    if (code === 0) {
      localStorage.setItem(StoreKeys.USER, JSON.stringify(data));
      return;
    } else {
      throw new Error(message);
    }
  }

  throw new Error('登陆异常');
};

export const logout = async (): Promise<void> => {
  await fetchTemplate('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
