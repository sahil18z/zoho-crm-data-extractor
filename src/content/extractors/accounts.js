export function accounts() {
  const links = Array.from(
    document.querySelectorAll('a[id^="listView_"]')
  );

  const results = [];

  links.forEach((link) => {
    const id = link.id.replace("listView_", "");
    if (!id) return;

    const row =
      link.closest('[role="row"]') ||
      link.closest('lyte-exptable-tr') ||
      link.closest('tr');

    if (!row) return;

    const cells = Array.from(
      row.querySelectorAll('lyte-exptable-td, td')
    );

    // Extract visible row text (for owner)
    let tokens = row.innerText
      .split("\n")
      .flatMap(line => line.split("\t"))
      .map(t => t.trim())
      .filter(Boolean);

    // Remove account name
    tokens = tokens.filter(t => t !== link.innerText.trim());

    // Remove phone numbers
    tokens = tokens.filter(t => !/\+?\d[\d\s\-()]{7,}/.test(t));

    // Remove website URLs
    tokens = tokens.filter(t => !/^https?:\/\//i.test(t));

    /*
      Remaining token should be:
      → Account Owner
    */
    const owner = tokens[tokens.length - 1] || "";

    const account = {
      id,
      name: link.innerText.trim(),
      website: findLink(cells, "http"),
      phone: findPhone(cells),
      owner
    };

    if (account.id && account.name) {
      results.push(account);
    }
  });

  return results;
}

/* ================== HELPERS ================== */

function findLink(cells, keyword) {
  const link = cells
    .map(c => c.querySelector(`a[href*="${keyword}"]`))
    .find(Boolean);

  return link?.innerText.trim() || "";
}

function findPhone(cells) {
  const cell = cells.find(c =>
    /\+?\d[\d\s\-()]{7,}/.test(c.innerText)
  );
  return cell?.innerText.trim() || "";
}
