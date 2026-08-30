import { readExpectedPagesSmokeContract, smokePagesHttp } from "./pages-http-smoke.mjs";

const siteUrl = process.env.PAGES_DEPLOYMENT_URL || process.env.NEXT_PUBLIC_SITE_URL;

if (!siteUrl) {
  throw new Error("PAGES_DEPLOYMENT_URL or NEXT_PUBLIC_SITE_URL is required.");
}

const contract = await readExpectedPagesSmokeContract();
const result = await smokePagesHttp(siteUrl, {
  expectedCanonicalSiteUrl: contract.canonicalSiteUrl,
  expectedDataVersion: contract.dataVersion,
  expectedWorkbook: contract.workbook,
  expectedDetailPathnames: contract.detailPathnames,
});
console.log(
  `Deployed Pages smoke check passed for ${result.siteUrl} (data version ${result.dataVersion}).`,
);
