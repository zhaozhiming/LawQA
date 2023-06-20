import { useEffect, useState } from 'react';
import { Mode, StoreKeys } from '@/common/constants';

export default function Home() {
  const [mode, setMode] = useState<string>(Mode.LIGHT);

  useEffect(() => {
    const storeMode = localStorage.getItem(StoreKeys.MODE) || Mode.LIGHT;
    setMode(storeMode);
  }, []);
  
  return (
    <div className={`w-full h-full flex ${mode === Mode.DARK ? 'dark' : ''}`}>
      Hello World
    </div>
  );
}
