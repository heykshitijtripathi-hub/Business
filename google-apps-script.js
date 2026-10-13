/**
 * ==============================================================================
 * DRIVERS SAATHI — MASTER GOOGLE APPS SCRIPT LEAD CAPTURE ENGINE (V2)
 * ==============================================================================
 * 
 * 100% 1-to-1 Column Match with Website Form Fields:
 *   1. Client Leads         -> Matches all fields from client-hire.html & index.html
 *   2. Driver Applications  -> Matches all fields from driver-apply.html & index.html
 *   3. Corporate Leads      -> Matches all fields from index.html (Fleet Panel)
 * 
 * Auto-Headers: Updates Row 1 in your Google Sheet automatically with styled headers.
 * Safe Numbers: Formats phone numbers with ' to prevent Google Sheets #ERROR!.
 * ==============================================================================
 */

const SPREADSHEET_CONFIG = {
  CLIENT_SHEET_NAME: "Client Leads",
  DRIVER_SHEET_NAME: "Driver Applications",
  FLEET_SHEET_NAME: "Corporate Leads",
  TIMEZONE: "Asia/Kolkata"
};

/**
 * ==============================================================================
 * RUN THIS FUNCTION ONCE DIRECTLY IN APPS SCRIPT:
 * Select "setupAllHeaders" from the dropdown next to "Run" and click "Run".
 * It will instantly create / update all 19 Client columns & 15 Driver columns!
 * ==============================================================================
 */
function setupAllHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Client Leads (19 columns)
  const clientHeaders = [
    "Timestamp (IST)",
    "Client Name",
    "Phone Number",
    "Email",
    "NCR Region",
    "Exact Address & Society",
    "Car Model",
    "Transmission Type",
    "Hiring Purpose",
    "Driver Salary / Budget",
    "Duty Tenure & Type",
    "Preferred Duty Timings / Trip Dates",
    "Preferred Trial Date",
    "Driver Experience Required",
    "Driver Age Preference",
    "Verification Preference",
    "Special Requirements",
    "Lead Source",
    "Lead Status",
    "Assigned Driver / Notes"
  ];
  getOrCreateSheet(ss, SPREADSHEET_CONFIG.CLIENT_SHEET_NAME, clientHeaders, "#0284C7");

  // 2. Driver Applications (16 columns)
  const driverHeaders = [
    "Timestamp (IST)",
    "Full Name",
    "Phone",
    "Current Area in NCR",
    "Native Home State",
    "Car Transmission Skills",
    "Driving Experience",
    "Accommodation / Stay-in",
    "Duty Type Preference",
    "Smartphone & Google Maps Knowledge",
    "Expected Salary / Rate",
    "DL Number",
    "1-Day Paid Trial Ready",
    "Lead Source",
    "Application Status",
    "Verification / Background Notes"
  ];
  getOrCreateSheet(ss, SPREADSHEET_CONFIG.DRIVER_SHEET_NAME, driverHeaders, "#166534");

  // 3. Corporate Leads (9 columns)
  const fleetHeaders = [
    "Timestamp (IST)",
    "Company Name",
    "Contact Person",
    "Phone Number",
    "Email",
    "Fleet Size",
    "City / Region",
    "Requirements",
    "Lead Status"
  ];
  getOrCreateSheet(ss, SPREADSHEET_CONFIG.FLEET_SHEET_NAME, fleetHeaders, "#4338CA");
}

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = parseIncomingData(e);
    const timestamp = Utilities.formatDate(new Date(), SPREADSHEET_CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm:ss");

    // Guard: Ignore submissions if both name and phone are empty
    const checkName = (data["Client Name"] || data["Full Name"] || data["Name"] || data["Company Name"] || "").toString().trim();
    const checkPhone = (data["Phone Number"] || data["Phone"] || data["Mobile Number"] || "").toString().trim();
    if (!checkName && !checkPhone) {
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({
        status: "ignored",
        message: "Ignored empty submission"
      })).setMimeType(ContentService.MimeType.JSON);
    }

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
      message: "Lead recorded successfully in Google Sheets with complete field mapping",
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
  // Allows testing and refreshes headers on GET request
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  refreshAllHeaders(ss);
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Drivers Saathi Google Sheet Webhook is live! All column headers synchronized.",
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
  const cat = (data["Category"] || data["Inquiry Category"] || data["Enquiry Type"] || "").toLowerCase();
  if (cat.includes("driver") && (cat.includes("job") || cat.includes("application") || cat.includes("registration"))) return true;
  if (data["DL Number"] || data["d-dl-num"] || data["Commercial DL"] || data["1-Day Paid Trial Ready"] || data["Current Area in NCR"]) return true;
  return false;
}

function isFleetRequest(data) {
  const cat = (data["Category"] || data["Inquiry Category"] || "").toLowerCase();
  if (cat.includes("fleet") || cat.includes("corporate") || cat.includes("b2b")) return true;
  if (data["Company Name"] || data["f-company"] || data["Fleet Size"]) return true;
  return false;
}

/**
 * CLIENT LEADS: 1-to-1 Column Mapping with client-hire.html & index.html
 */
function recordClientLead(ss, data, timestamp) {
  const headers = [
    "Timestamp (IST)",
    "Client Name",
    "Phone Number",
    "Email",
    "NCR Region",
    "Exact Address & Society",
    "Car Model",
    "Transmission Type",
    "Hiring Purpose",
    "Driver Salary / Budget",
    "Duty Tenure & Type",
    "Preferred Duty Timings / Trip Dates",
    "Preferred Trial Date",
    "Driver Experience Required",
    "Driver Age Preference",
    "Verification Preference",
    "Special Requirements",
    "Lead Source",
    "Lead Status",
    "Assigned Driver / Notes"
  ];

  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.CLIENT_SHEET_NAME, headers, "#0284C7");

  const name = data["Client Name"] || data["Full Name"] || data["Name"] || data["c-name"] || data["i-name"] || "";
  const phone = data["Phone Number"] || data["Phone"] || data["c-phone"] || data["i-phone"] || "";
  const email = data["Email"] || data["i-email"] || "";
  const region = data["NCR Region"] || data["City / Area"] || data["c-city"] || data["i-city"] || "";
  const address = data["Exact Address & Society"] || data["c-locality"] || "";
  const car = data["Car Model"] || data["Vehicle Model"] || data["Car"] || data["c-car"] || data["i-vehicle"] || "";
  const trans = data["Transmission Type"] || data["Transmission"] || data["c-trans"] || "Manual";
  const purpose = data["Hiring Purpose"] || data["Driver Type"] || data["Service"] || data["c-purpose"] || "Monthly Family Driver";
  const salary = data["Driver Salary / Budget"] || data["Budget"] || data["c-salary"] || "";
  const tenure = data["Duty Tenure & Type"] || data["Tenure"] || "";
  const timings = data["Preferred Duty Timings / Trip Dates"] || data["c-time"] || "";
  const trialDate = data["Preferred Trial Date"] || data["Trial Date"] || data["c-trialdate"] || data["i-trial"] || "";
  const exp = data["Driver Experience Required"] || data["c-exp"] || "";
  const age = data["Driver Age Preference"] || data["c-age"] || "No Specific Preference";
  const verification = data["Verification Preference"] || data["c-bg"] || "Standard Verified (Police + DL + Aadhaar)";
  const notes = data["Special Requirements"] || data["Additional Details"] || data["c-notes"] || data["i-details"] || "";
  const source = data["Lead Source"] || data["How did you hear about us?"] || data["c-source"] || data["Source"] || "";

  const row = [
    timestamp,
    name,
    formatPhone(phone),
    email,
    region,
    address,
    car,
    trans,
    purpose,
    salary,
    tenure,
    timings,
    trialDate,
    exp,
    age,
    verification,
    notes,
    source,
    "New Lead",
    ""
  ];

  sheet.appendRow(row);
  return { type: "Client", row: sheet.getLastRow() };
}

/**
 * DRIVER APPLICATIONS: 1-to-1 Column Mapping with driver-apply.html & index.html
 */
function recordDriverApplication(ss, data, timestamp) {
  const headers = [
    "Timestamp (IST)",
    "Full Name",
    "Phone",
    "Current Area in NCR",
    "Native Home State",
    "Car Transmission Skills",
    "Driving Experience",
    "Accommodation / Stay-in",
    "Duty Type Preference",
    "Smartphone & Google Maps Knowledge",
    "Expected Salary / Rate",
    "DL Number",
    "1-Day Paid Trial Ready",
    "Lead Source",
    "Application Status",
    "Verification / Background Notes"
  ];

  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.DRIVER_SHEET_NAME, headers, "#166534");

  const name = data["Full Name"] || data["Driver Name"] || data["Name"] || data["d-name"] || "";
  const phone = data["Phone"] || data["Phone Number"] || data["d-phone"] || "";
  const area = data["Current Area in NCR"] || data["City / Area"] || data["Area"] || data["d-city"] || "";
  const nativeState = data["Native Home State"] || data["d-native"] || "Delhi NCR";
  const trans = data["Car Transmission Skills"] || data["Transmission"] || data["d-license"] || "";
  const exp = data["Driving Experience"] || data["Experience"] || data["d-exp"] || "";
  const stayin = data["Accommodation / Stay-in"] || data["d-stayin"] || "";
  const duty = data["Duty Type Preference"] || data["Duty Preference"] || data["d-duty"] || data["d-dutytype"] || "";
  const maps = data["Smartphone & Google Maps Knowledge"] || data["d-maps"] || "Yes (रोज इस्तेमाल करता हूँ)";
  const salary = data["Expected Salary / Rate"] || data["Expected Salary"] || data["Salary"] || data["d-salary"] || data["d-salaryexp"] || "";
  const dl = data["DL Number"] || data["d-dl"] || data["d-dl-num"] || "";
  const trialReady = data["1-Day Paid Trial Ready"] || data["d-trialready"] || "Yes, Ready for 1-Day Trial";
  const source = data["Lead Source"] || data["How did you hear about us?"] || data["d-source"] || data["Source"] || "";

  const row = [
    timestamp,
    name,
    formatPhone(phone),
    area,
    nativeState,
    trans,
    exp,
    stayin,
    duty,
    maps,
    salary,
    dl,
    trialReady,
    source,
    "Pending Verification",
    ""
  ];

  sheet.appendRow(row);
  return { type: "Driver", row: sheet.getLastRow() };
}

/**
 * FLEET LEADS: 1-to-1 Column Mapping with Corporate Fleet Panel
 */
function recordFleetLead(ss, data, timestamp) {
  const headers = [
    "Timestamp (IST)",
    "Company Name",
    "Contact Person",
    "Phone Number",
    "Email",
    "Fleet Size",
    "City / Region",
    "Requirements",
    "Lead Status"
  ];

  const sheet = getOrCreateSheet(ss, SPREADSHEET_CONFIG.FLEET_SHEET_NAME, headers, "#4338CA");

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
    formatPhone(phone),
    email,
    fleetSize,
    region,
    notes,
    "New Lead"
  ];

  sheet.appendRow(row);
  return { type: "Fleet", row: sheet.getLastRow() };
}

/**
 * Format phone numbers so Google Sheets never interprets leading '+' as a mathematical formula
 */
function formatPhone(phone) {
  if (!phone) return "";
  const p = phone.toString().trim();
  return p.startsWith("'") ? p : "'" + p;
}

/**
 * Get or create sheet and ensure Row 1 has complete formatted headers
 */
function getOrCreateSheet(ss, name, headers, headerColor) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  // Set headers in Row 1
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight("bold");
  headerRange.setBackground(headerColor);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  return sheet;
}

function refreshAllHeaders(ss) {
  recordClientLead(ss, {}, Utilities.formatDate(new Date(), SPREADSHEET_CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm:ss"));
}
