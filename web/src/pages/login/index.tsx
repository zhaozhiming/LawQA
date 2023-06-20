import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { throttle } from 'lodash';
import { login } from '@/services/user';

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // eslint-disable-next-line
  const handleLogin = useCallback(
    throttle(async () => {
      setError('');
      const usernameTrim = username.trim();
      const passwordTrim = password.trim();
      if (usernameTrim === '' || passwordTrim === '') {
        setError('用户名或密码不能为空');
        return;
      }
      try {
        await login(usernameTrim, passwordTrim);
        setError('');
        router.push('/');
      } catch (e: any) {
        setError(`登陆失败: ${e.message}`);
      }
    }, 1000),
    [username, password]
  );

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
      return false;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-20">
      <header className="p-10">
        <h1 className="text-3xl font-semibold">欢迎</h1>
      </header>
      <input
        className="px-4 py-0 h-14 w-80 text-base bg-white border border-indigo-500 rounded mb-6"
        type="text"
        placeholder="请输入用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="px-4 py-0 h-14 w-80 text-base bg-white border border-indigo-500 rounded mb-6"
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handlePasswordKeyDown}
      />
      {error && <div className="text-red-500 py-1 px-4 text-sm">{error}</div>}
      <button
        className="px-1 py-4 text-base bg-emerald-600 text-white rounded w-80 h-14 hover:bg-emerald-700"
        onClick={handleLogin}
      >
        登录
      </button>
    </div>
  );
};

export default Login;
