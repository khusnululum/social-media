import axios from "axios";

export const api = axios.create({
  baseURL: "https://be-social-media-api-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});
