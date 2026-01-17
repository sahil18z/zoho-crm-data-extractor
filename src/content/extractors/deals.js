export function deals() {
  // Deal links look like: <a id="listView_<DEAL_ID>">
  const links = Array.from(
    document.querySelectorAll('a[id^="listView_"]')
  );

  const seen = new Set();
  const results = [];

  links.forEach((link) => {
    const id = link.id.replace("listView_", "");
    if (!id || seen.has(id)) return;
    seen.add(id);

    // Zoho virtual row
    const row =
      link.closest('[role="row"]') ||
      link.closest('lyte-exptable-tr') ||
      link.closest('tr') ||
      link.closest('div');

    if (!row) return;

    const cells = Array.from(
      row.querySelectorAll("lyte-exptable-td, td, div")
    );

    const deal = {
      id,
      name: link.innerText.trim(),
      amount: findAmount(cells),
      stage: findStage(cells),
      closingDate: findDate(cells),
      account: findAccount(cells),
      contact: findContact(cells),
      pipeline: getPipelineName(),
    };

    if (deal.id && deal.name) {
      results.push(deal);
    }
  });

  return results;
}

/* ================== HELPERS ================== */

function getPipelineName() {
  // 1️ Selected pipeline tab (BEST case)
  const selectedTab = document.querySelector(
    '[role="tab"][aria-selected="true"]'
  );

  if (
    selectedTab?.innerText &&
    selectedTab.innerText.length < 40 &&
    !selectedTab.innerText.includes("\n")
  ) {
    return selectedTab.innerText.trim();
  }

  // 2️ Pipeline dropdown button
  const pipelineButton = Array.from(
    document.querySelectorAll("button")
  ).find(
    btn =>
      btn.innerText?.includes("Pipeline") &&
      btn.innerText.length < 40
  );

  if (pipelineButton) {
    return pipelineButton.innerText
      .replace("Pipeline", "")
      .trim();
  }

  // 3️ Safe fallback
  return "All Pipelines";
}

function findAmount(cells) {
  const cell = cells.find(c =>
    /^rs\./i.test(c.innerText?.trim())
  );
  return cell?.innerText.trim() || "";
}

function findStage(cells) {
  const stages = [
    "Qualification",
    "Needs Analysis",
    "Value Proposition",
    "Negotiation/Review",
    "Proposal/Price Quote",
    "Closed Won",
    "Closed Lost",
  ];

  const cell = cells.find(c =>
    stages.some(stage =>
      c.innerText?.toLowerCase().includes(stage.toLowerCase())
    )
  );

  return cell?.innerText.trim() || "";
}

function findDate(cells) {
  const cell = cells.find(c =>
    /\d{2}\/\d{2}\/\d{4}/.test(c.innerText)
  );
  return cell?.innerText.trim() || "";
}

function findAccount(cells) {
  const link = cells
    .map(c => c.querySelector('a[href*="/tab/Accounts/"]'))
    .find(Boolean);

  return link?.innerText.trim() || "";
}

function findContact(cells) {
  const link = cells
    .map(c => c.querySelector('a[href*="/tab/Contacts/"]'))
    .find(Boolean);

  return link?.innerText.trim() || "";
}
