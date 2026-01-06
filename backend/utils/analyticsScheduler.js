import cron from "node-cron";
import PriceHistory from "../models/PriceHistory.js";
import Crop from "../models/Crop.js";
import marketDataService from "../services/marketDataService.js";

// Config via env
const schedule = process.env.MARKET_CRON || "*/30 * * * *"; // every 30 minutes

// Exported scheduler now respects env flags; Redis/caching removed per request
export async function scheduleMarketPulls() {
    const schedulerEnabled = process.env.MARKET_SCHEDULER !== "false";
    const apiKey = process.env.MARKET_API_KEY;
    if (!schedulerEnabled) {
        console.log("[MarketScheduler] MARKET_SCHEDULER is disabled by config; skipping market pulls.");
        return;
    }
    if (!apiKey) {
        console.log("[MarketScheduler] MARKET_API_KEY not set; skipping market pulls until an API key is configured.");
        return;
    }

    console.log("Scheduling market data pulls (cron):", schedule);
    // Schedule background task
    cron.schedule(schedule, async () => {
        console.log("[MarketScheduler] Running market pull job");
        try {
            // Get crops that have a symbol defined (for provider mapping)
            const crops = await Crop.find({ symbol: { $exists: true, $ne: "" } }).lean();
            for (const c of crops) {
                const symbol = c.symbol;
                if (!symbol) continue;
                try {
                    const result = await marketDataService.fetchMarketPrice(symbol);
                    if (result && result.avgPrice != null) {
                        const date = new Date();
                        const entry = new PriceHistory({
                            cropId: c._id,
                            source: result.source,
                            sourceSymbol: symbol,
                            date: date,
                            avgPrice: result.avgPrice,
                            minPrice: result.minPrice,
                            maxPrice: result.maxPrice,
                        });
                        await entry.save();

                        // caching removed — no Redis usage
                        console.log(`[MarketScheduler] Saved price for ${c.name || symbol}`);
                    } else {
                        console.warn(`[MarketScheduler] No valid price returned for ${symbol}`);
                    }
                } catch (err) {
                    console.error(`[MarketScheduler] Failed to fetch for ${symbol}:`, err.message || err);
                }
            }
        } catch (err) {
            console.error("[MarketScheduler] Scheduler error:", err);
        }
    });
}

export default { scheduleMarketPulls };