import axios from "axios";

export const getAllProducts = async () => {
  try {
    const response = await axios.get("/api/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductByName = async (productName) => {
  try {
    const response = await axios.get(`/api/products/${productName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
