export const API_BASE = import.meta.env.VITE_API_BASE
  || (import.meta.env.PROD ? 'https://projectspecai.onrender.com/api/v1' : 'http://localhost:3001/api/v1');

export default API_BASE;
