import { StoreKeys } from '../common/constants';
import { User } from '../types/user';

export const authorityHeader = (options?: Record<string, any>) => {
  const updateOptions = { ...options };
  const storeUser = localStorage.getItem(StoreKeys.USER);
  if (storeUser && options) {
    const user: User = JSON.parse(storeUser);
    updateOptions.headers = {
      ...updateOptions.headers,
      Authorization: `Bearer ${user.access_token}`,
    };
  }
  return updateOptions;
};

export const fetchTemplate = async (
  url: string,
  options: Record<string, any>
) => {
  const response = await fetch(url, authorityHeader(options));
  if (response.ok) {
    const result = await response.json();
    const { code, message, data } = result;
    if (code === 0) {
      return data;
    }
    throw new Error(message);
  } else {
    switch (response.status) {
      case 400: {
        throw new Error('请求参数错误');
      }
      case 401: {
        window.location.replace('/login');
        return;
      }
      case 404: {
        throw new Response('页面找不到', { status: 404 });
      }
      case 500: {
        throw new Response('服务器错误', { status: 500 });
      }
      default: {
        throw new Error('未知异常');
      }
    }
  }
};
