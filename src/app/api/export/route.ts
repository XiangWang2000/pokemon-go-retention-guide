export function GET(request: Request) {
  return Response.redirect(new URL("/exports/pokemon-go-retention-001-030.xlsx", request.url), 307);
}
