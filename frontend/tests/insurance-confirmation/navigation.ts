export const navigations: string[] = [];
export function useRouter() {
  return { push: (path: string) => { navigations.push(path); } };
}
