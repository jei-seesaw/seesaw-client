import { useQuery } from "@tanstack/react-query";
import { getAffiliations } from "../api/affiliationApi";
import { affiliationKeys } from "./queryKeys";

export function useAffiliationsQuery() {
  return useQuery({
    queryKey: affiliationKeys.all,
    queryFn: getAffiliations,
    // Reference data — rarely changes.
    staleTime: 5 * 60_000,
  });
}
