import API from "./api";

/*
  GET DASHBOARD STATS
*/
export async function getDashboardStats() {
  try {
    const response =
      await API.get(
        "/dashboard/stats"
      );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
}