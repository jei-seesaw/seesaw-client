import { useQuery } from "@tanstack/react-query";
import { httpClient } from "./httpClient";

export interface HealthStatus {
  status: string;
}

export function getHealth(): Promise<HealthStatus> {
  return httpClient.get<HealthStatus>("/health");
}

export const healthKeys = {
  all: ["health"] as const,
};

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: getHealth,
  });
}
