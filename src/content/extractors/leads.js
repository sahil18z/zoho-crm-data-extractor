export function leads() {
  const links = Array.from(
    document.querySelectorAll('a[href*="/tab/Leads/"]')
  );

  const seen = new Set();
  const results = [];

  links.forEach((link) => {
    const match = link.href.match(/Leads\/(\d+)/);
    if (!match) return;

    const id = match[1];
    if (seen.has(id)) return;
    seen.add(id);

    const row =
      link.closest('[role="row"]') ||
      link.closest('lyte-tr') ||
      link.closest('tr');

    if (!row) return;

    // 1️ Collect visible text
    let tokens = row.innerText
      .split("\n")
      .flatMap(line => line.split("\t"))
      .map(t => t.trim())
      .filter(Boolean);

    // Remove lead name
    tokens = tokens.filter(t => t !== link.innerText.trim());

    // Remove dates like "Jan 16"
    tokens = tokens.filter(t => !/^[A-Z][a-z]{2}\s\d{1,2}$/.test(t));

    // Remove owner name (appears repeatedly)
    tokens = tokens.filter(t => t !== "Sahil Thorat");

    /*
      After cleanup, tokens order is:
      0 → Company
      1 → Email
      2 → Phone
      3 → Lead Source
    */

    const lead = {
      id,
      name: link.innerText.trim(),
      company: tokens[0] || "",
      email: tokens[1] || "",
      phone: tokens[2] || "",
      leadSource: tokens[3] || "",
    };

    results.push(lead);
  });

  return results;
}
