import API from "./api";

export async function getInsights() {
  try {
    const response = await API.get("/insights");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
