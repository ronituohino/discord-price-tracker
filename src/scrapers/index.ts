export type UrlMatcher = (url: string) => boolean;
export type Scraper = (productPageUrl: string) => Promise<string | undefined>;

import { jimmsUrl, jimms } from "./jimms.js";

const scrapers = [[jimmsUrl, jimms]] satisfies [[UrlMatcher, Scraper]];

export async function getProductPrice(url: string) {
  for (let i = 0; i < scrapers.length; i++) {
    const scraper = scrapers[i];
    if (scraper[0](url)) {
      return await scraper[1](url);
    }
  }
}
