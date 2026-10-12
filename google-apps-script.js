/**
 * ==============================================================================
 * DRIVERS SAATHI — MASTER GOOGLE APPS SCRIPT LEAD CAPTURE ENGINE
 * ==============================================================================
 * 
 * This script connects your website (driverssaathi.com) directly to Google Sheets.
 * Every time someone submits:
 *   1. Client Driver Hire Request  -> Saved to "Client Leads" tab
 *   2. Driver Job Application      -> Saved to "Driver Applications" tab
 *   3. Corporate Fleet Request     -> Saved to "Corporate Leads" tab
 * 
 * ------------------------------------------------------------------------------
 * HOW TO INSTALL (Takes 2 minutes):
 * ------------------------------------------------------------------------------
 * 1. Open Google Sheets (https://sheets.new) and name it "Drivers Saathi - Master CRM".
 * 2. Click: Extensions -> Apps Script.
 * 3. Delete any default code in the editor, and PASTE THIS ENTIRE FILE.
 * 4. Click: Save (Ctrl + S).
 * 5. Click: Deploy (top right blue button) -> "New deployment".
 * 6. Click the gear icon next to "Select type" -> Choose "Web app".
 * 7. Configuration settings:
 *      - Description: Drivers Saathi Lead Webhook
 *      - Execute as: Me (your Google account)
 *      - Who has access: Anyone  <-- (VERY IMPORTANT: must be "Anyone")
 * 8. Click "Deploy" -> Authorize access with your Google account.
 * 9. COPY the "Web App URL" (it looks like https://script.google.com/macros/s/AKfycb.../exec).
 * ==============================================================================
 */

const SPREADSHEET_CONFIG = {
  CLIENT_SHEET_NAME: "Client Leads",
  DRIVER_SHEET_NAME: "Driver Applications",
  FLEET_SHEET_NAME: "Corporate Leads",
  TIMEZONE: "Asia/Kolkata"
};

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = parseIncomingData(e);
    const timestamp = Utilities.formatDate(new Date(), SPREADSHEET_CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm:ss");

    let result;
    if (isDriverApplication(data)) {
      result = recordDriverApplication(ss, data, timestamp);
    } else if (isFleetRequest(data)) {
      result = recordFleetLead(ss, data, timestamp);
    } else {
      result = recordClientLead(ss, data, timestamp);
    }

    lock.releaseLock();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded successfully in Google Sheets",
      type: result.type,
      row: result.row
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Drivers Saathi Google Sheet Webhook is live and ready to receive leads!",
    timestamp: Utilities.formatDate(new Date(), SPREADSHEET_CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}

function parseIncomingData(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {}
  }
  const params = {};
  if (e.parameter) {
    for (let key in e.parameter) {
      params[key] = e.parameter[key];
    }
  }
  return params;
}

function isDriverApplication(data) {
  const cat = (data["Category"] || data["Inquiry Category"] || "").toLowerCase();
  if (cat.includes("driver") && (cat.includes("job") || cat.includes("application"))) return true;
  if (data["DL Number"] || data["d-dl-num"] || data["Commercial DL"] || data["1-Day Paid Trial Ready"]) return true;
  return false;
}

function isFleetRequest(data) {
  const cat = (data["Category"] || data["Inquiry Category"] || "").toLowerCase();
  if (cat.includes("fleet") || cat.includes("corporate") || cat.includes("b2b")) return true;
  if (data["Company Name"] || data["f-company"] || data["Fleet Size"]) return true;
  return false;
}

function recordClientLead(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.CLIENT_SHEET_NAME, [
    "Timestamp (IST)",
    "Client Name",
    "Phone / WhatsApp",
    "Email",
    "Region / City",
    "Exact Address / Locality",
    "Car Brand & Model",
    "Transmission",
    "Hiring Purpose",
    "Budget / Salary",
    "Tenure / Shift",
    "Preferred Trial Date",
    "Experience Required",
    "Special Requirements / Notes",
    "Lead Status",
    "Assigned Driver"
  ], "#0284C7");

  const name = data["Client Name"] || data["Full Name"] || data["Name"] || data["c-name"] || data["i-name"] || "";
  const phone = data["Phone Number"] || data["Phone"] || data["c-phone"] || data["i-phone"] || "";
  const email = data["Email"] || data["i-email"] || "";
  const region = data["NCR Region"] || data["City / Area"] || data["c-city"] || data["i-city"] || "";
  const address = data["Exact Address & Society"] || data["c-locality"] || "";
  const car = data["Car Model"] || data["Vehicle Model"] || data["Car"] || data["c-car"] || data["i-vehicle"] || "";
  const trans = data["Transmission Type"] || data["Transmission"] || data["c-trans"] || "Manual";
  const purpose = data["Hiring Purpose"] || data["Service"] || data["c-purpose"] || "Monthly Family Driver";
  const salary = data["Driver Salary / Budget"] || data["Budget"] || data["c-salary"] || "";
  const tenure = data["Duty Tenure & Type"] || data["Tenure"] || "";
  const trialDate = data["Preferred Trial Date"] || data["Trial Date"] || data["c-trialdate"] || data["i-trial"] || "";
  const exp = data["Driver Experience Required"] || data["c-exp"] || "";
  const notes = data["Special Requirements"] || data["Additional Details"] || data["c-notes"] || data["i-details"] || "";

  const row = [
    timestamp,
    name,
    phone,
    email,
    region,
    address,
    car,
    trans,
    purpose,
    salary,
    tenure,
    trialDate,
    exp,
    notes,
    "New Lead",
    ""
  ];

  sheet.appendRow(row);
  return { type: "Client", row: sheet.getLastRow() };
}

function recordDriverApplication(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.DRIVER_SHEET_NAME, [
    "Timestamp (IST)",
    "Driver Name",
    "Mobile Number",
    "City / Locality",
    "Transmission Skills",
    "Driving Experience",
    "Duty Preference",
    "Expected Salary",
    "DL Number",
    "Trial Ready?",
    "Application Status",
    "Verification Notes"
  ], "#166534");

  const name = data["Full Name"] || data["Driver Name"] || data["Name"] || data["d-name"] || "";
  const phone = data["Phone Number"] || data["Phone"] || data["d-phone"] || "";
  const city = data["City / Area"] || data["Area"] || data["d-city"] || "";
  const trans = data["Car Transmission Skills"] || data["Transmission"] || data["d-license"] || "";
  const exp = data["Experience"] || data["Driving Experience"] || data["d-exp"] || "";
  const duty = data["Duty Type Preference"] || data["Duty Preference"] || data["d-dutytype"] || "";
  const salary = data["Expected Salary"] || data["Salary"] || data["d-salaryexp"] || "";
  const dl = data["DL Number"] || data["d-dl-num"] || "";
  const trialReady = data["1-Day Paid Trial Ready"] || data["d-trialready"] || "Yes";

  const row = [
    timestamp,
    name,
    phone,
    city,
    trans,
    exp,
    duty,
    salary,
    dl,
    trialReady,
    "Pending Verification",
    ""
  ];

  sheet.appendRow(row);
  return { type: "Driver", row: sheet.getLastRow() };
}

function recordFleetLead(ss, data, timestamp) {
  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.FLEET_SHEET_NAME, [
    "Timestamp (IST)",
    "Company / Fleet Name",
    "Contact Person",
    "Phone Number",
    "Email",
    "Fleet Size",
    "City / Region",
    "Requirement Details",
    "Status"
  ], "#4338CA");

  const company = data["Company Name"] || data["f-company"] || "";
  const person = data["Contact Person"] || data["Full Name"] || data["f-name"] || "";
  const phone = data["Phone Number"] || data["Phone"] || data["f-phone"] || "";
  const email = data["Email"] || data["f-email"] || "";
  const fleetSize = data["Fleet Size"] || data["Number of Drivers"] || data["f-size"] || "";
  const region = data["City / Region"] || data["f-city"] || "";
  const notes = data["Requirements"] || data["Details"] || data["f-notes"] || "";

  const row = [
    timestamp,
    company,
    person,
    phone,
    email,
    fleetSize,
    region,
    notes,
    "New Lead"
  ];

  sheet.appendRow(row);
  return { type: "Fleet", row: sheet.getLastRow() };
}

function getOrCreateSheet(ss, name, headers, headerColor) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground(headerColor);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    for (let c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 160);
    }
  }
  return sheet;
}
