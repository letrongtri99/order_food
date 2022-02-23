import { AxiosResponse } from "axios";
import httpClient from "./http-client";
import { User } from "@interfaces";

export function me(): Promise<AxiosResponse<User>> {
  return httpClient.get(`users/me`);
}
