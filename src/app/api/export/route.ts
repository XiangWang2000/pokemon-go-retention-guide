import { CURRENT_DATA_SCOPE } from "@/config/data-scope";

export function GET(request: Request) {
  return Response.redirect(
    new URL(`/exports/pokemon-go-retention-${CURRENT_DATA_SCOPE}.xlsx`, request.url),
    307,
  );
}
