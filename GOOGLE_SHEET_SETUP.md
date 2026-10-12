# 📊 Drivers Saathi — Google Sheet Lead Sync Setup Guide

Connect your website forms to a live Google Sheet in **less than 2 minutes**.

Whenever someone fills:
* **Client Driver Hire Request** &rarr; Automatically saved to the **"Client Leads"** tab.
* **Driver Job Application** &rarr; Automatically saved to the **"Driver Applications"** tab.
* **Corporate / Fleet Inquiry** &rarr; Automatically saved to the **"Corporate Leads"** tab.

---

## Step 1: Create Your Google Sheet

1. Open your browser and go to: **[sheets.new](https://sheets.new)**
2. Rename the spreadsheet (top left) to: **`Drivers Saathi - Master CRM`**

---

## Step 2: Open Apps Script

1. In the Google Sheet top menu, click: **Extensions** &rarr; **Apps Script**
2. A new tab will open with code editor.
3. Select everything in the editor (`Ctrl + A`) and delete it.
4. Open the file **[`google-apps-script.js`](./google-apps-script.js)** in your project folder, copy all code, and paste it into the editor.
5. Click the **Save** icon (or press `Ctrl + S`).

---

## Step 3: Deploy as Web App

1. In the top right corner, click the blue **Deploy** button &rarr; **New deployment**.
2. Click the gear icon (⚙️) next to *Select type* &rarr; select **Web app**.
3. Fill in the deployment details:
   * **Description:** `Drivers Saathi Lead Capture`
   * **Execute as:** `Me (your Google email)`
   * **Who has access:** **`Anyone`** *(⚠️ IMPORTANT: Must select "Anyone" so website visitors can submit leads without logging into Google).*
4. Click **Deploy**.
5. Google will ask you to *Authorize access*:
   * Click **Review Permissions** &rarr; choose your Google account.
   * Click **Advanced** (small link at bottom) &rarr; Click **Go to Drivers Saathi (unsafe)**.
   * Click **Allow**.
6. Google will show you a **Web app URL** that looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. Click **Copy** to copy this URL.

---

## Step 4: Activate on Your Website

1. Open **[`lead-sync.js`](./lead-sync.js)** in your code editor.
2. In line 13, paste your copied URL:
   ```javascript
   var DRIVERS_SAATHI_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
3. Save the file and push to GitHub (`git add . && git commit -m "Add Google Sheet webhook" && git push origin main`).

---

## How It Works Automatically

* You do **not** need to manually create columns or tabs in your Google Sheet!
* The script automatically creates:
  * **"Client Leads"** (with 16 blue styled headers: Timestamp, Name, Phone, Car Model, Transmission, Budget, etc.)
  * **"Driver Applications"** (with 12 green styled headers: Timestamp, Name, Phone, Area, Transmission, Experience, DL Number, etc.)
  * **"Corporate Leads"** (with 9 indigo styled headers)
* All timestamps are automatically recorded in **Indian Standard Time (IST)**.
