import zh from '../../messages/zh.json';
import en from '../../messages/en.json';
export function useTranslations(namespace: string) {
  const messages = document.documentElement.lang === 'en' ? en : zh;
  return (key: string) => {
    const value = (messages as any)[namespace]?.[key];
    if (typeof value !== 'string') throw new Error(`Missing translation: ${namespace}.${key}`);
    return value;
  };
}
