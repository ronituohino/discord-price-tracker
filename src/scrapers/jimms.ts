import puppeteer from "puppeteer";
import type { ScraperParams, ScraperReturnValue } from "./index.js";

export async function jimms({
  productPageUrl,
}: ScraperParams): Promise<ScraperReturnValue> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(productPageUrl);
  const element = await page.waitForSelector(`span[itemprop="price"]`);
  const price = await element.evaluate(el => el.textContent);

  await browser.close();
  return {
    price,
  };
}
