import { httpClient } from "@/shared/api";
import type { HomeSummary } from "../model/types";

export function getHomeSummary(): Promise<HomeSummary> {
  return httpClient.get<HomeSummary>("/home");
}
