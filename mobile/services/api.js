import axios from "axios";

import {
  API_BASE_URL as envBaseUrl,
} from "@env";

// Forced Metro re-compilation to break dotenv cache and load new IP
let API_BASE_URL = envBaseUrl;



console.log(
  "Resolved API_BASE_URL:",
  API_BASE_URL
);

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Server took too long to respond. Is the backend running?";
    } else if (error.message === "Network Error") {
      error.message = `Cannot reach API at ${API_BASE_URL}. Check backend and API_BASE_URL in .env`;
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default API;