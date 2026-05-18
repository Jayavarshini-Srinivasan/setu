import axios from "axios";

import {
  API_BASE_URL,
} from "@env";

console.log(
  "API_BASE_URL:",
  API_BASE_URL
);

const API =
  axios.create({
    baseURL:
      API_BASE_URL,
  });

export default API;