# Zoho CRM Data Extractor – Chrome Extension (Manifest V3)

A **Chrome Extension (MV3)** that extracts data from **Zoho CRM** modules using **DOM scraping**, stores it safely in `chrome.storage.local`, and displays it in a **React popup dashboard**.

This project was built to demonstrate:
- Multi-module extraction
- Proper MV3 architecture
- Data integrity & persistence
- Clean separation of concerns
- Real-world handling of Zoho CRM’s virtual DOM (Lyte)

---

##  Features

###  Supported Modules
- **Leads**
- **Contacts**
- **Accounts**
- **Deals** (pipeline-aware)
- **Tasks**

###  Extracted Fields

#### Leads
- Lead Name  
- Company  
- Email  
- Phone  
- Lead Source  

#### Contacts
- Contact Name  
- Account Name  
- Email  
- Phone  

#### Accounts
- Account Name  
- Phone  
- Website  

#### Deals
- Deal Name  
- Amount  
- Stage  
- Closing Date  
- Account Name  
- Contact Name  
- Pipeline Name  

#### Tasks
- Subject  
- Due Date  
- Status  
- Priority  
- Related To  
- Contact Name  

---

##  Key Technical Highlights

### Manifest V3 Architecture
- **Service Worker** for storage & data merging
- **Content Scripts** for DOM extraction
- **Message Passing** (`chrome.runtime.sendMessage`)
- No background pages (MV2 deprecated patterns avoided)

###  Robust DOM Scraping
- Handles **Zoho’s Lyte virtual tables**
- Waits for async-rendered rows using `MutationObserver`
- Avoids brittle selectors

###  Pipeline-Aware Deals Extraction
- Pipeline name is **detected dynamically**
- No hardcoded pipeline assumptions
- Supports multiple pipelines if present
- Current Zoho org shows `"All Pipelines"` (single pipeline setup)

###  Data Persistence
- Extracted data persists across:
  - Page refresh
  - Module switching
- Stored in a normalized schema

###  Deduplication & Data Integrity
- ID-based merging
- Safe updates (no data loss when extracting other modules)
- Race-condition protection for concurrent extractions

###  Shadow DOM Visual Feedback
- Extraction status indicator injected into Zoho UI
- Uses **Shadow DOM** for style isolation
- Shows:
  - Module detected
  - Extraction progress
  - Success / empty state

---

##  Storage Schema

```json
{
  "zoho_data": {
    "leads": [],
    "contacts": [],
    "accounts": [],
    "deals": [],
    "tasks": [],
    "lastSync": 1234567890
  }
}
## Storage Design

- Per-module storage (Leads, Contacts, Accounts, Deals, Tasks)
- ID-based merge strategy to avoid duplicates
- Last sync timestamp tracked globally for visibility and debugging


## Project Structure


src
├── assets
│   └── react.svg
├── background
│   └── serviceWorker.js
├── content
│   ├── extractors
│   │   ├── accounts.js
│   │   ├── contacts.js
│   │   ├── deals.js
│   │   ├── index.js
│   │   ├── leads.js
│   │   └── tasks.js
│   ├── index.js
│   ├── moduleDetector.js
│   └── shadowIndicator.js
├── popup
│   ├── App.jsx
│   ├── index.css
│   ├── index.html
│   └── main.jsx
└── storage
    └── schema.js



##  How It Works

1. Open any Zoho CRM module (Leads / Contacts / Accounts / Deals / Tasks)
2. Click the Chrome extension icon
3. Click **“Extract Current Module”**

**Content Script Flow**
- Detects the active Zoho CRM module
- Waits for virtual rows to render (Zoho async DOM)
- Extracts visible data from the page
- Sends extracted data to the Service Worker

**Background / Storage Flow**
- Service Worker receives extracted data
- Data is merged using ID-based deduplication
- Existing records are updated, new ones are added
- Storage is persisted in `chrome.storage.local`

**Popup UI**
- React popup listens to storage changes
- Dashboard updates instantly without refresh


##  Popup Dashboard Features

- Tabs for all modules:
  - Leads
  - Contacts
  - Accounts
  - Deals (grouped by pipeline)
  - Tasks
- Global search and filter across extracted data
- Delete individual records from storage
- Last sync timestamp displayed per module


##  Final Notes

This extension is built to reflect real-world Zoho CRM constraints:

- Asynchronous rendering
- Virtualized tables (Lyte components)
- Multi-module extraction consistency
- Safe storage updates with race-condition protection

The focus of this project is **correctness, robustness, and clean architecture**, not shortcuts.

**Author:** Sahil Thorat