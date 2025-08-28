const KEY = 'jwt';
export const saveToken = (t: string) => localStorage.setItem(KEY, t);
export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem(KEY) : null);
export const clearToken = () => localStorage.removeItem(KEY);
