import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const isDev = process.env.NODE_ENV === "development";

const instance = axios.create({
  timeout: 20000,
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API,
});

instance.interceptors.request.use(
  (requestConfig: AxiosRequestConfig) => {
    return requestConfig;
  },
  (error) => {
    if (isDev) {
      console.error("API Request Error:", error);
    }
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Try to find the access token from response
    // if (response.data?.token?.accessToken) {
    //   instance.defaults.headers = {
    //     ...instance.defaults.headers,
    //     Authorization: `Bearer ${response.data?.token?.accessToken}`
    //   };
    // }

    return response;
  },
  (error) => {
    if (isDev) {
      console.error("API Response Error:", error);
    }
    // const errorMessage = error?.response?.data?.message;
    // if (errorMessage) {
    //   return Promise.reject(new Error(errorMessage));
    // }
    return Promise.reject(error);
  }
);

export default instance;
