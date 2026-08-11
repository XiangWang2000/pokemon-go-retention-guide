import {
  readExpectedPagesDataVersion,
  smokePagesHttp,
} from "./pages-http-smoke.mjs";

const siteUrl = process.env.PAGES_DEPLOYMENT_URL || process.env.NEXT_PUBLIC_SITE_URL;

if (!siteUrl) {
  throw new Error("PAGES_DEPLOYMENT_URL or NEXT_PUBLIC_SITE_URL is required.");
}

const expectedDataVersion = await readExpectedPagesDataVersion();
const result = await smokePagesHttp(siteUrl, { expectedDataVersion });
console.log(`Deployed Pages smoke check passed for ${result.siteUrl} (data version ${result.dataVersion}).`);
