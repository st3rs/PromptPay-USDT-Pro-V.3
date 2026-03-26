import { bitkub } from "./bitkub";
import { prisma } from "../prisma";

export const DEFAULT_EXCHANGE_RATE = 35.50;
export const RATE_MARKUP = 2.00;

export async function getLiveUsdtRate() {
  let fallbackRate = DEFAULT_EXCHANGE_RATE;
  try {
    // Check if there's a manual rate set in the database
    const manualRate = await prisma.exchangeRate.findUnique({
      where: { pair: "USDT/THB" }
    });

    if (manualRate) {
      fallbackRate = manualRate.rate;
    }

    if (manualRate && manualRate.source === "MANUAL") {
      return {
        marketRate: manualRate.rate,
        sellingRate: manualRate.rate + RATE_MARKUP,
        source: "Manual",
        timestamp: manualRate.updatedAt.toISOString(),
      };
    }

    const symbol = "THB_USDT";
    const ticker = await bitkub.getTicker(symbol);
    
    if (!ticker) {
      console.warn(`Failed to fetch ${symbol} ticker from Bitkub. Using fallback rate of ${fallbackRate}.`);
      return {
        marketRate: fallbackRate,
        sellingRate: fallbackRate + RATE_MARKUP,
        source: "Fallback",
        timestamp: new Date().toISOString(),
      };
    }

    const marketRate = ticker.last;
    const sellingRate = marketRate + RATE_MARKUP;

    return {
      marketRate,
      sellingRate,
      source: "Bitkub",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Unexpected error fetching live rate:", error);
    return {
      marketRate: fallbackRate,
      sellingRate: fallbackRate + RATE_MARKUP,
      source: "Fallback",
      timestamp: new Date().toISOString(),
    };
  }
}
