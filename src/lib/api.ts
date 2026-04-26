import axios from 'axios';

// @ts-ignore
export const API_URL = import.meta.env.VITE_API_BASE_URL || '/';

export const getWsUrl = (path: string) => {
  // If API_URL is relative or points to the current host, use window.location
  if (API_URL.startsWith('/') || API_URL.includes(window.location.host)) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${path.startsWith('/') ? path : '/' + path}`;
  }
  const wsBase = API_URL.replace(/^http/, 'ws');
  return `${wsBase}${path}`;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
