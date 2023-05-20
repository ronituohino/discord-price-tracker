import type { UrlMatcher, Scraper } from "./index.js";
import { parse } from "node-html-parser";

export const jimmsUrl: UrlMatcher = (url) => {
  return url.startsWith("https://www.jimms.fi");
};

export const jimms: Scraper = async (productPageUrl) => {
  const result = await fetch(productPageUrl);
  const page = await result.text();
  const parsedHtml = parse(page);
  // meta tag unlikely to change in the near future
  const price = parsedHtml
    .querySelector("meta[property='product:price:amount']")
    .getAttribute("content");

  if (price.includes(".")) {
    return price.replace(".", ",") + "0 €";
  } else {
    return price + ",00 €";
  }
};
