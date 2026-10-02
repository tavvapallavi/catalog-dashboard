# Catalog Desk – Product Catalog Admin Dashboard

An internal-tool style dashboard for reviewing and cleaning up product listings, built with React and Vite.
Data comes from the DummyJSON API; edits are kept in memory (the API does not save changes).

## Features
- Sortable, filterable, paginated data table (search, category filter, "only listings with issues")
- Listing quality score (0–100%) per product from 5 checks, with a hover list of what failed
- Add / edit product form with validation and accessible error messages
- Bulk select and bulk delete
- Charts: products by category, clean vs. flawed listings
- Light / dark mode
- Unit tests for the quality scoring (Vitest)

## Run locally
    npm install
    npm run dev
    npm test

## Screenshots
(add here)
