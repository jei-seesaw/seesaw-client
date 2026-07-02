import { useQuery } from "@tanstack/react-query";
import { getHomeSummary } from "../api/homeApi";
import { homeKeys } from "./queryKeys";

export function useHomeSummaryQuery() {
  return useQuery({
    queryKey: homeKeys.summary,
    queryFn: getHomeSummary,
  });
}
