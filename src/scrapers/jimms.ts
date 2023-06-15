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
  const element = parsedHtml.querySelector(
    "meta[property='product:price:amount']"
  );
  if (element === null) {
    const title = parsedHtml.querySelector("title").innerText;
    if (title.includes("Tuotetta ei ")) {
      return { status: "product_removed" };
    } else {
      return { status: "unable_to_scrape" };
    }
  }

  const price = element.getAttribute("content");

  if (!price) {
  }

  if (price.includes(".")) {
    return { status: "success", price: price.replace(".", ",") + "0 €" };
  } else {
    return { status: "success", price: price + ",00 €" };
  }
};
