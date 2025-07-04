import axios from "axios";
const PORT = process.env.BACKEND_PORT
const HOST = process.env.HOST
export const searchProducts = async (query = "") => {
  try {
    const response = await axios.get(`http://${HOST}:${PORT}/api/v1/product/search?q=${query}`);
    return response.data;
  } catch (err) {
    console.error("Search failed:", err);
    return [];
  }
};
