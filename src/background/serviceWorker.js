// ================== EXTRACTION LOCK ==================
let extractionLock = false;
let lockOwnerTab = null;
let lockTimestamp = 0;
const LOCK_TIMEOUT = 5000; // 5 seconds

// ================== MESSAGE LISTENER ==================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "STORE_DATA") return;

  const now = Date.now();
  const senderTabId = sender.tab?.id ?? null;

  // ================== LOCK ACQUIRE ==================
  if (!extractionLock || now - lockTimestamp > LOCK_TIMEOUT) {
    extractionLock = true;
    lockOwnerTab = senderTabId;
    lockTimestamp = now;
  }

  // ================== IGNORE CONCURRENT WRITES ==================
  if (senderTabId !== lockOwnerTab && now - lockTimestamp < LOCK_TIMEOUT) {
    console.warn("Ignored concurrent extraction write from tab:", senderTabId);
    return;
  }

  // ================== STORAGE MERGE ==================
  chrome.storage.local.get("zoho_data", (res) => {
    const existing = res.zoho_data || {
      leads: [],
      contacts: [],
      accounts: [],
      deals: [],
      tasks: [],
      lastSync: null
    };

    const merged = mergeData(existing, msg.payload);

    chrome.storage.local.set(
      {
        zoho_data: {
          ...existing,   //  preserve all modules
          ...merged,     //  update only extracted module
          lastSync: Date.now()
        }
      },
      () => {
        // ================== RELEASE LOCK ==================
        extractionLock = false;
        lockOwnerTab = null;
        lockTimestamp = 0;
      }
    );
  });
});

// ================== SAFE MERGE (DEDUP BY ID) ==================
function mergeData(existing, incoming) {
  const result = {};

  Object.keys(incoming).forEach((module) => {
    const existingById = Object.fromEntries(
      (existing[module] || []).map(item => [item.id, item])
    );

    const incomingById = Object.fromEntries(
      incoming[module].map(item => [item.id, item])
    );

    result[module] = Object.values({
      ...existingById,
      ...incomingById
    });
  });

  return result;
}
