import { deals, leads, contacts, accounts, tasks } from "./extractors";
import { detectModule } from "./moduleDetector";
import { showIndicator } from "./shadowIndicator";

// ================== BOOTSTRAP ==================
console.log("Zoho CRM content script injected");

// ================== MESSAGE LISTENER ==================
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "EXTRACT_NOW") {
    runExtraction();
  }
});

// ================== CORE EXTRACTION ==================
function runExtraction() {
  const module = detectModule();
  console.log("Detected module:", module);

  if (!module) {
    showIndicator("Unable to detect Zoho module", "error");
    return;
  }

  showIndicator(`Waiting for ${module} data…`, "loading");

  waitForRows(() => {
    showIndicator(`Extracting ${module}…`, "loading");

    let data = [];

    try {
      switch (module) {
        case "leads":
          data = leads();
          break;
        case "contacts":
          data = contacts();
          break;
        case "accounts":
          data = accounts();
          break;
        case "deals":
          data = deals();
          break;
        case "tasks":
          data = tasks();
          break;
        default:
          data = [];
      }
    } catch (err) {
      console.error("Extraction error:", err);
      showIndicator(`Failed to extract ${module}`, "error");
      return;
    }

    if (data.length > 0) {
      console.log(`Extracted ${data.length} ${module}`);

      chrome.runtime.sendMessage({
        type: "STORE_DATA",
        payload: { [module]: data }
      });

      showIndicator(
        `${module.charAt(0).toUpperCase() + module.slice(1)} extracted successfully`,
        "success"
      );
    } else {
      console.warn(`No ${module} rows found`);
      showIndicator(`No ${module} data found`, "error");
    }
  });
}

// ================== ROW WAIT HELPER (ZOHO SAFE) ==================
function waitForRows(callback) {
  const hasRows = () => {
    // Zoho virtual tables render links first
    return document.querySelectorAll("a[href]").length > 30;
  };

  if (hasRows()) {
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    if (hasRows()) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Safety timeout — do not hang forever
  setTimeout(() => {
    observer.disconnect();
    console.warn("Row wait timeout");
  }, 6000);
}
