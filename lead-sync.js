/**
 * ==============================================================================
 * DRIVERS SAATHI — CLIENT-SIDE GOOGLE SHEETS SYNC CLIENT
 * ==============================================================================
 * 
 * Automatically captures all form submissions (Client Hires, Driver Applications,
 * and Fleet Requests) and mirrors them to your Google Sheet in real-time.
 * 
 * HOW TO ACTIVATE:
 * Once you deploy the Google Apps Script, paste your deployed Web App URL below:
 */

var DRIVERS_SAATHI_GOOGLE_SHEET_URL = window.DRIVERS_SAATHI_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbwwDzVleh9OZPadFhxHJPUab4q2PO08theLEwVVEY5CuVwswvUvGdsShBMs0mdFXPHZsA/exec";

(function() {
  function syncFormToGoogleSheet(form) {
    if (!DRIVERS_SAATHI_GOOGLE_SHEET_URL) {
      // URL not configured yet
      return;
    }

    try {
      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function(value, key) {
        var str = (value || "").toString().trim();
        // Prevent Google Sheets formula parse error if phone starts with +
        if ((key.toLowerCase().indexOf("phone") !== -1 || key.toLowerCase().indexOf("mobile") !== -1) && str.indexOf("+") === 0) {
          str = "'" + str;
        }
        payload[key] = str;
      });

      // Send to Google Apps Script Webhook asynchronously (no-cors prevents browser blocks)
      fetch(DRIVERS_SAATHI_GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      }).catch(function(err) {
        console.warn("Google Sheet sync notice:", err);
      });
    } catch (e) {
      console.warn("Lead sync error:", e);
    }
  }

  // Auto-attach to all forms on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function() {
    var forms = document.querySelectorAll("form");
    forms.forEach(function(form) {
      form.addEventListener("submit", function() {
        syncFormToGoogleSheet(form);
      });
    });
  });

  window.syncFormToGoogleSheet = syncFormToGoogleSheet;
})();
