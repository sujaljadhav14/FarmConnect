# Market Analytics — API & Frontend

This document summarises the new Market Analytics endpoints and the frontend inputs required.

## Backend endpoints

1. GET /api/analytics/price-trend
   - Query parameters:
     - cropId (optional): ObjectId of Crop to filter
     - start (optional): ISO date string `YYYY-MM-DD` (defaults to last 90 days)
     - end (optional): ISO date string `YYYY-MM-DD` (defaults to today)
     - interval (optional): `daily` (default) | `weekly` | `monthly`
   - Response: `{ data: [{ label, avgPrice, minPrice, maxPrice, totalQty }], start, end }`

2. GET /api/analytics/top-crops
   - Query parameters:
     - limit (optional): number of top crops to return (default 5)
     - start, end (optional): date range for aggregation (defaults to last 365 days)
   - Response: `{ data: [{ cropId, cropName, totalQty, totalValue }], start, end }`

## Frontend inputs (Trader Analytics page)

- Crop (optional): dropdown of crops. If omitted, analytics are aggregated across all crops.
- Start Date (optional): pick a start date; if omitted, a sensible default is used (last N days).
- End Date (optional): pick an end date; defaults to today.
- Interval: `daily`, `weekly`, or `monthly`.

Notes: both the chart and Top Crops widget are dynamically fetched based on inputs.
## Server: external market feeds & caching

I implemented a scheduled market data pull and Redis caching. To enable this feature configure the following environment variables in the backend `.env`:

- `MARKET_API_PROVIDER` (optional): `alpha_vantage` (default) or `rapidapi`
- `MARKET_API_KEY`: your API key for the provider
- `RAPIDAPI_HOST` (required if `MARKET_API_PROVIDER=rapidapi`)
- `REDIS_URL` (optional): e.g. `redis://127.0.0.1:6379` (if not set, caching is disabled)
- `MARKET_CRON` (optional): cron schedule for the pulls; default `*/30 * * * *` (every 30 minutes)
- `MARKET_SCHEDULER` (optional): set to `false` to explicitly disable scheduled pulls (default `true` when `MARKET_API_KEY` is set)

Notes: You can temporarily disable external market pulls by either leaving `MARKET_API_KEY` empty or setting `MARKET_SCHEDULER=false` in your `.env`.

Installation (backend):

npm install axios node-cron redis

Notes about provider selection:
- Alpha Vantage is stock/FX-focused; you'll need to map your `Crop` documents to a provider `symbol` (added as `crop.symbol`).
- For RapidAPI, pick a marketplace commodity endpoint and set `RAPIDAPI_HOST` accordingly; the fetcher uses a placeholder path and must be adjusted to the chosen endpoint's response format.
## Installation (frontend)

To show charts, install the chart libraries in the `frontend` folder:

npm install chart.js react-chartjs-2

If these packages are not installed, the page will show a table fallback and a message prompting installation.
