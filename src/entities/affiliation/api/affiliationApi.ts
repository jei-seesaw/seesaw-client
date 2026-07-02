import { httpClient } from "@/shared/api";
import type { Affiliation } from "../model/types";

export function getAffiliations(): Promise<Affiliation[]> {
  return httpClient.get<Affiliation[]>("/affiliations");
}
