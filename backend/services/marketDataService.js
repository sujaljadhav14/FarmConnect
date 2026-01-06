import axios from "axios";

// This service supports pluggable providers.
// It expects env variables:
// - MARKET_API_PROVIDER (alpha_vantage | rapidapi)
// - MARKET_API_KEY
// - RAPIDAPI_HOST (if using rapidapi endpoints)

// const provider = process.env.MARKET_API_PROVIDER || "alpha_vantage";
// const apiKey = process.env.MARKET_API_KEY;

// // NOTE: Agricultural 'crop' symbols are not standard like stocks; you will
// // map your internal crop to a 'symbol' (string) that a provider recognizes.
// // Example mapping should be stored in DB/config. For now the service accepts a symbol.

// export async function fetchFromAlphaVantage(symbol) {
//   if (!apiKey) throw new Error("Missing MARKET_API_KEY for Alpha Vantage");
//   // Example: use GLOBAL_QUOTE as a sample; Alpha Vantage is mostly for stocks/FX
// //   const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
//   const res = await axios.get(url, { timeout: 10_000 });
//   const data = res.data || {};
//   const quote = data["Global Quote"] || {};
//   // Map expected fields; fallback to nulls
//   const price = quote["05. price"] ? Number(quote["05. price"]) : null;
//   const low = quote["04. low"] ? Number(quote["04. low"]) : null;
//   const high = quote["03. high"] ? Number(quote["03. high"]) : null;
//   return {
//     source: "alpha_vantage",
//     sourceSymbol: symbol,
//     date: new Date(),
//     avgPrice: price,
//     minPrice: low,
//     maxPrice: high,
//   };
// }

// export async function fetchFromRapidAPI(symbol) {
//   // RapidAPI usage varies per endpoint; you must pick an endpoint for commodity prices
//   if (!apiKey) throw new Error("Missing MARKET_API_KEY for RapidAPI");
//   const host = process.env.RAPIDAPI_HOST;
//   if (!host) throw new Error("Missing RAPIDAPI_HOST for RapidAPI provider");

//   // Example: a placeholder request - the actual path depends on chosen API
//   const url = `https://${host}/price`; // NOTE: change when selecting real endpoint

//   const res = await axios.get(url, {
//     headers: {
//       "X-RapidAPI-Key": apiKey,
//       "X-RapidAPI-Host": host,
//     },
//     params: { symbol },
//     timeout: 10_000,
//   });

//   const payload = res.data || {};
//   // Map fields from payload according to the endpoint's response structure
//   // This is a generic mapper; adapt after selecting a real RapidAPI endpoint
//   return {
//     source: `rapidapi/${host}`,
//     sourceSymbol: symbol,
//     date: new Date(),
//     avgPrice: payload.price || payload.avg || null,
//     minPrice: payload.low || null,
//     maxPrice: payload.high || null,
//   };
// }

// export async function fetchMarketPrice(symbol) {
//   // symbol: string (provider-specific symbol), required
//   if (!symbol) throw new Error("Symbol is required to fetch market price");
//   if (!apiKey) throw new Error("MARKET_API_KEY is not configured");
//   try {
//     if (provider === "rapidapi") return await fetchFromRapidAPI(symbol);
//     // default alpha_vantage
//     return await fetchFromAlphaVantage(symbol);
//   } catch (err) {
//     // bubble up error to caller for retry/backoff handling
//     throw err;
//   }
// }

// export default { fetchMarketPrice };