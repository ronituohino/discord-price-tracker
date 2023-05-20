export type UrlMatcher = (url: string) => boolean;
export type Scraper = (productPageUrl: string) => Promise<string | undefined>;

import { isCurrencyString } from "../utils.js";
import { jimmsUrl, jimms } from "./jimms.js";

const scrapers = [[jimmsUrl, jimms]] satisfies [[UrlMatcher, Scraper]];

export async function getProductPrice(
  url: string
): Promise<string | undefined> {
  for (let i = 0; i < scrapers.length; i++) {
    const scraper = scrapers[i];
    if (scraper[0](url)) {
      const price = await scraper[1](url);

      // Regex to validate that the price is in correct format:
      if (isCurrencyString(price)) {
        return price;
      } else {
        return undefined;
      }
    }
  }
}
