/**
 * ==============================================================================
 * DRIVERS SAATHI — BULLETPROOF REAL-TIME GOOGLE SHEETS & EMAIL SYNC
 * ==============================================================================
 * 
 * Intercepts form submissions across all pages (Client Hires, Driver Applications,
 * and Fleet Requests), guarantees data transmission to Google Sheets using keepalive
 * before page unload, sends backup email via FormSubmit, and displays instant feedback.
 */

var DRIVERS_SAATHI_GOOGLE_SHEET_URL = window.DRIVERS_SAATHI_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycbzjSkDxpf2yyu0QE2Kk-bQiU2srG2Xtpe5QGRsR14T2WySK3xjqFHzCryjkUebhEAd-YA/exec";

(function() {
  function formatPayload(form) {
    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function(value, key) {
      var str = (value || "").toString().trim();
      // Prefix '+' with single quote to prevent Google Sheets formula parse error (#ERROR!)
      if ((key.toLowerCase().indexOf("phone") !== -1 || key.toLowerCase().indexOf("mobile") !== -1) && str.indexOf("+") === 0) {
        str = "'" + str;
      }
      payload[key] = str;
    });
    return payload;
  }

  function handleFormSubmit(form, e) {
    if (form.getAttribute("data-ds-synced") === "true") {
      return; // Already processed
    }

    if (e && e.preventDefault) {
      e.preventDefault();
    }

    var payload = formatPayload(form);

    // Validation Guard: Require at least a Name or Phone Number
    var nameVal = (payload["Client Name"] || payload["Full Name"] || payload["Name"] || payload["Company Name"] || "").trim();
    var phoneVal = (payload["Phone Number"] || payload["Phone"] || payload["Mobile Number"] || "").trim();
    if (!nameVal && !phoneVal) {
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    var originalBtnText = submitBtn ? (submitBtn.innerText || submitBtn.value) : "Submit";
    if (submitBtn) {
      submitBtn.disabled = true;
      if (submitBtn.tagName === "BUTTON") {
        submitBtn.innerText = "कृपया प्रतीक्षा करें (Submitting...)...";
      }
    }

    // 1. Send to Google Sheets Webhook (keepalive ensures background completion even on mobile)
    var googleSheetSync = fetch(DRIVERS_SAATHI_GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    }).catch(function(err) {
      console.warn("Google Sheet sync notice:", err);
    });

    // 2. Send to FormSubmit via AJAX in parallel so email notification is delivered without page redirect
    var formSubmitSync = fetch("https://formsubmit.co/ajax/support@driverssaathi.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(function(err) {
      console.warn("FormSubmit notice:", err);
    });

    // 3. Guarantee max 1.2s wait so the driver or client is never delayed
    var timeoutGuard = new Promise(function(resolve) {
      setTimeout(resolve, 1200);
    });

    Promise.race([
      Promise.all([googleSheetSync, formSubmitSync]),
      timeoutGuard
    ]).then(function() {
      form.setAttribute("data-ds-synced", "true");

      // Check if page has an in-page successBox (e.g. driver-apply.html)
      var successBox = document.getElementById("successBox");
      if (successBox) {
        form.style.display = "none";
        successBox.style.display = "block";
        successBox.scrollIntoView({ behavior: "smooth" });
      } else {
        // Fallback: Submit form natively if no on-page success container
        form.submit();
      }
    }).catch(function() {
      form.setAttribute("data-ds-synced", "true");
      form.submit();
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    var forms = document.querySelectorAll("form");
    forms.forEach(function(form) {
      form.addEventListener("submit", function(e) {
        handleFormSubmit(form, e);
      });
    });
  });

  window.syncFormToGoogleSheet = function(form) {
    handleFormSubmit(form, null);
  };
})();
