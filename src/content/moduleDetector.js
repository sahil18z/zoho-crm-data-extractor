export function detectModule() {
  let url = "";

  try {
    // Always read top-level SPA URL
    url = window.top.location.href;
  } catch {
    return null;
  }

  if (url.includes("/tab/Leads")) return "leads";
  if (url.includes("/tab/Contacts")) return "contacts";
  if (url.includes("/tab/Accounts")) return "accounts";

  //  IMPORTANT: Deals are called "Potentials" internally
  if (url.includes("/tab/Potentials")) return "deals";

  if (url.includes("/tab/Tasks")) return "tasks";

  return null;
}
