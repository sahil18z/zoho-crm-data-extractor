import { useEffect, useState } from "react";
import {
  Database,
  Download,
  Trash2,
  Layers,
  Users,
  Briefcase,
  CheckSquare,
  Search,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";

const TABS = ["leads", "contacts", "accounts", "deals", "tasks"];

const TAB_META = {
  leads: { label: "Leads", icon: Users },
  contacts: { label: "Contacts", icon: Users },
  accounts: { label: "Accounts", icon: Briefcase },
  deals: { label: "Deals", icon: Layers },
  tasks: { label: "Tasks", icon: CheckSquare },
};

export default function App() {
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState("leads");
  const [search, setSearch] = useState("");

  // ================== STORAGE SYNC ==================
  useEffect(() => {
    chrome.storage.local.get("zoho_data", (res) => {
      setData(res.zoho_data || {});
    });

    const onChange = () => {
      chrome.storage.local.get("zoho_data", (res) => {
        setData(res.zoho_data || {});
      });
    };

    chrome.storage.onChanged.addListener(onChange);
    return () => chrome.storage.onChanged.removeListener(onChange);
  }, []);

  // ================== EXTRACT ==================
  const extract = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      if (!tab?.id || !tab.url) return alert("No active tab found.");
      if (!tab.url.includes("crm.zoho"))
        return alert("Please open a Zoho CRM module page.");
      chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_NOW" });
    });
  };

  // ================== DELETE ==================
  const deleteRecord = (module, id) => {
    chrome.storage.local.get("zoho_data", (res) => {
      chrome.storage.local.set({
        zoho_data: {
          ...res.zoho_data,
          [module]: res.zoho_data[module].filter((r) => r.id !== id),
        },
      });
    });
  };

  // ================== SEARCH ==================
  const matchesSearch = (item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(item)
      .filter((v) => typeof v === "string")
      .some((v) => v.toLowerCase().includes(q));
  };

  // ================== EXPORT HELPERS ==================
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const records = data[activeTab] || [];
    downloadFile(
      JSON.stringify(records, null, 2),
      `zoho_${activeTab}.json`,
      "application/json"
    );
  };

  const exportCSV = () => {
    const records = data[activeTab] || [];
    if (!records.length) return alert("No data to export");

    const headers = Object.keys(records[0]);
    const rows = [
      headers.join(","),
      ...records.map((row) =>
        headers
          .map((h) =>
            `"${String(row[h] ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ];

    downloadFile(
      rows.join("\n"),
      `zoho_${activeTab}.csv`,
      "text/csv"
    );
  };

  // ================== EMPTY STATE ==================
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Database className="w-8 h-8 text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">No records found</p>
      <p className="text-xs text-gray-400 mt-1">
        Try extracting or adjusting your search
      </p>
    </div>
  );

  // ================== LIST ==================
  const renderList = (items = [], module) => {
    const filtered = items.filter(matchesSearch);
    if (!filtered.length) return <EmptyState />;

    return (
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between
                       rounded-lg border border-gray-200 bg-white
                       px-3 py-2 hover:border-blue-300 transition"
          >
            <div className="truncate">
              <div className="text-sm font-medium text-gray-900 truncate">
                {item.name || item.subject || item.id}
              </div>
              {item.email && (
                <div className="text-xs text-gray-500 truncate">
                  {item.email}
                </div>
              )}
            </div>

            <button
              onClick={() => deleteRecord(module, item.id)}
              className="opacity-0 group-hover:opacity-100
                         text-red-500 hover:text-red-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // ================== DEALS ==================
  const renderDealsByPipeline = (deals = []) => {
    const grouped = deals.reduce((acc, deal) => {
      if (!matchesSearch(deal)) return acc;
      const key = deal.pipeline || "Unknown Pipeline";
      acc[key] = acc[key] || [];
      acc[key].push(deal);
      return acc;
    }, {});

    const pipelines = Object.entries(grouped).filter(
      ([, items]) => items.length
    );

    if (!pipelines.length) return <EmptyState />;

    return (
      <div className="space-y-4">
        {pipelines.map(([pipeline, items]) => (
          <div
            key={pipeline}
            className="rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center justify-between
                            px-3 py-2 border-b bg-gray-50 rounded-t-xl">
              <span className="text-xs font-semibold text-gray-700">
                {pipeline}
              </span>
              <span className="text-xs text-gray-500">
                {items.length} deals
              </span>
            </div>

            <div className="divide-y">
              {items.map((deal) => (
                <div
                  key={deal.id}
                  className="group flex items-center justify-between
                             px-3 py-2 hover:bg-gray-50 transition"
                >
                  <div className="truncate">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {deal.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {deal.stage}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteRecord("deals", deal.id)}
                    className="opacity-0 group-hover:opacity-100
                               text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ================== UI ==================
  return (
    <div className="w-[420px] h-[560px]
                    bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700
                    p-4">
      <div className="absolute inset-0 bg-blue-400/20 blur-3xl pointer-events-none" />

      <div className="relative h-full rounded-2xl bg-white
                      shadow-[0_20px_40px_rgba(0,0,0,0.12)]
                      p-4 flex flex-col text-sm">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Zoho CRM Data Extractor
          </h1>
          {data.lastSync && (
            <p className="text-xs text-gray-500 mt-0.5">
              Last sync · {new Date(data.lastSync).toLocaleString()}
            </p>
          )}
        </div>

        {/* Extract */}
        <button
          onClick={extract}
          className="w-full flex items-center justify-center gap-2
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:opacity-95 text-white font-semibold
                     py-2.5 rounded-xl mb-3 transition shadow"
        >
          <Download className="w-4 h-4" />
          Extract Current Module
        </button>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm
                       border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Export */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={exportCSV}
            className="flex-1 flex items-center justify-center gap-1.5
                       text-xs font-semibold py-2 rounded-lg
                       border border-gray-200 hover:bg-gray-50 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="flex-1 flex items-center justify-center gap-1.5
                       text-xs font-semibold py-2 rounded-lg
                       border border-gray-200 hover:bg-gray-50 transition"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {TABS.map((tab) => {
            const Icon = TAB_META[tab].icon;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5
                            py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === tab
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {TAB_META[tab].label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pr-1">
          {activeTab === "deals"
            ? renderDealsByPipeline(data.deals)
            : renderList(data[activeTab], activeTab)}
        </div>
      </div>
    </div>
  );
}
