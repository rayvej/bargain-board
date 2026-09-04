# Bargain Board

Bargain Board is an automated deal aggregation app that scrapes multiple data sources, normalizes deals, verifies coupons using a three-tier headless verification system, and stores them in Firebase Firestore for a frontend application to consume.

## Architecture

- **Scrapers:** RSS Feeds, Best Buy API, eBay Browse API, LinkMyDeals API.
- **Processing:** Normalization, intelligent category/subcategory assignment, ID deduplication.
- **Verification:** Playwright-based coupon checking (Tier 1 URL check, Tier 2 API checks, Tier 3 Full Checkout Simulation).
- **Automation:** Scheduled via GitHub Actions (`scrape-deals.yml` and `verify-coupons.yml`).

## Step-by-Step Setup Guide

### 1. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create Project** and name it "Bargain Board".
3. In the sidebar, navigate to **Firestore Database** and click **Create Database**.
   - Choose a location close to your users.
   - Start in **Production mode**.
4. Go to **Project Settings (Gear icon) > Service Accounts**.
5. Click **Generate new private key** and save the JSON file.

### 2. Procuring API Keys (Free Tiers)
- **Best Buy API:** Go to [Best Buy Developer Portal](https://developer.bestbuy.com/), create an account, and generate a key. (50,000 requests/day).
- **eBay Browse API:** Go to [eBay Developers Program](https://developer.ebay.com/), create an app, and copy the **Client ID** and **Client Secret**. (5,000 calls/day).
- **LinkMyDeals API:** Go to [LinkMyDeals](https://linkmydeals.com/), sign up, and retrieve your API key. (25 requests/day).

### 3. GitHub Repository & Secrets Configuration
1. Initialize a Git repository here and push it to GitHub.
2. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
3. Create the following **New repository secrets**:
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Paste the entire content of the Firebase service account JSON file you downloaded.
   - `BESTBUY_API_KEY`: Paste your Best Buy API key.
   - `EBAY_CLIENT_ID`: Paste your eBay Client ID.
   - `EBAY_CLIENT_SECRET`: Paste your eBay Client Secret.
   - `LINKMYDEALS_API_KEY`: Paste your LinkMyDeals API key.

### 4. GitHub Pages (Optional Frontend Deployment)
1. Go to **Settings > Pages** in your GitHub repository.
2. Select **Deploy from a branch**.
3. Set the branch to `main` and the folder to `/docs`.
4. Click **Save**.

### 5. Running Locally (First-run instructions)
If you want to run the pipeline manually before pushing to GitHub:

```bash
# Export your environment variables
export BESTBUY_API_KEY="your_key"
export EBAY_CLIENT_ID="your_id"
export EBAY_CLIENT_SECRET="your_secret"
export LINKMYDEALS_API_KEY="your_key"
export FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

# Scrape sources (will generate /tmp/bargain-board-*.json files)
node scripts/scrape-rss.js
node scripts/scrape-bestbuy.js
node scripts/scrape-ebay.js
node scripts/scrape-coupons.js

# Write everything to Firestore
node scripts/write-to-firestore.js

# Verify unverified coupons
node scripts/verify-coupons.js
```

## Maintenance
- **Expired Deals:** Stale deals (older than 7 days) are automatically deleted by the `cleanup-expired.js` cron job.
- **Workflow Logs:** Check the GitHub Actions tab to ensure jobs complete successfully and are not hitting rate limits.
