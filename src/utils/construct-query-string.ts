import { FilterPayload } from "@/shared/types";

type Params = {
  firstname: string[];
  lastname: string[];
  gender: string[];
};

export const constructQueryString = (params: FilterPayload): string => {
  const queryParams = new URLSearchParams();

  if (!params) {
    return queryParams.toString();
  }

  for (const key in params) {
    if (params[key] && params[key]?.length) {
      // Append each value for the same key as a separate query parameter
      params[key]?.forEach((param) => {
        queryParams.append(String(key), String(param));
      });
    }
  }

  return queryParams.toString();
};
