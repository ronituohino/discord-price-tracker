import puppeteer from "puppeteer";
import type { UrlMatcher, Scraper } from "./index.js";

export const jimmsUrl: UrlMatcher = (url) => {
  return url.startsWith("https://www.jimms.fi");
};

export const jimms: Scraper = async (productPageUrl) => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(productPageUrl);
  const element = await page.waitForSelector(`span[itemprop="price"]`);
  const price = await element.evaluate((el) => el.textContent);

  await browser.close();
  return price;
};
