import axios from "axios";

import {
  API_BASE_URL as envBaseUrl,
} from "@env";

let API_BASE_URL = envBaseUrl || "http://10.71.19.77:5000";

// Self-healing: if the URL uses a cached, inactive IP (e.g. 192.168.137.1), dynamically switch to the active IP
if (API_BASE_URL && API_BASE_URL.includes("192.168.137.1")) {
  API_BASE_URL = API_BASE_URL.replace("192.168.137.1", "192.168.0.110");
}

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