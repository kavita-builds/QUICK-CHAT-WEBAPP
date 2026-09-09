import axios from "axios";


export const url = "http://localhost:5000"

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});