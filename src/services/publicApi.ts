import axios from 'axios';
// Separate client: no bearer interceptor or credentials for public caching.
export default axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: false, timeout: 10000 });
