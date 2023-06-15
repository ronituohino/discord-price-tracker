export type UrlMatcher = (url: string) => boolean;
export type WebsiteResult = {
  price?: string;
  status: "success" | "product_removed" | "unable_to_scrape" | "error";
  error?: Error;
};
export type Scraper = (productPageUrl: string) => Promise<WebsiteResult>;

import { isCurrencyString } from "../utils.js";
import { jimmsUrl, jimms } from "./jimms.js";

const scrapers = [[jimmsUrl, jimms]] satisfies [[UrlMatcher, Scraper]];

export type ScrapingResult = {
  price?: string;
  status:
    | "success"
    | "product_removed"
    | "currency_format_incorrect"
    | "unable_to_scrape"
    | "no_scraper_found"
    | "error";
  error?: Error;
};
export async function getProductPrice(url: string): Promise<ScrapingResult> {
  try {
    for (let i = 0; i < scrapers.length; i++) {
      const scraper = scrapers[i];
      if (scraper[0](url)) {
        const result = await scraper[1](url);

        // Regex to validate that the price is in correct format:
        if (result.status === "success") {
          if (isCurrencyString(result.price)) {
            return { status: "success", price: result.price };
          } else {
            return { status: "currency_format_incorrect", price: result.price };
          }
        } else if (result.status === "product_removed") {
          return { status: "product_removed" };
        } else if (result.status === "unable_to_scrape") {
          return { status: "unable_to_scrape" };
        } else {
          // We hit an error in the scraper
          return { status: "error", error: result.error };
        }
      }
    }
    return { status: "no_scraper_found" };
  } catch (error) {
    return { status: "error", error };
  }
}
