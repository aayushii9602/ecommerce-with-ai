import axios from "axios";
// const BACKEND_PORT = process.env.BACKEND_PORT
// const HOST = process.env.HOST
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT;
const HOST = import.meta.env.VITE_HOST;
export const searchProducts = async (query = "") => {
  try {
    const response = await axios.get(`http://${HOST}:${BACKEND_PORT}/api/v1/product/search?q=${query}`);
    return response.data;
  } catch (err) {
    console.error("Search failed:", err);
    return [];
  }
};
