export function contacts() {
  const links = Array.from(
    document.querySelectorAll('a[href*="/tab/Contacts/"]')
  );

  const seen = new Set();
  const results = [];

  links.forEach((link) => {
    const match = link.href.match(/Contacts\/(\d+)/);
    if (!match) return;

    const id = match[1];
    if (seen.has(id)) return;
    seen.add(id);

    const row =
      link.closest('[role="row"]') ||
      link.closest('lyte-tr') ||
      link.closest('tr');

    if (!row) return;

    // Collect visible text
    let tokens = row.innerText
      .split("\n")
      .flatMap(line => line.split("\t"))
      .map(t => t.trim())
      .filter(Boolean);

    // Remove contact name
    tokens = tokens.filter(t => t !== link.innerText.trim());

    // Remove dates like "Jan 16", "Today"
    tokens = tokens.filter(
      t => !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\bToday\b)\s?\d*$/.test(t)
    );

    /*
      Expected remaining tokens order:
      0 → Account Name
      1 → Email
      2 → Phone
      3 → Owner
    */

    const contact = {
      id,
      name: link.innerText.trim(),
      account: tokens[0] || "",
      email: tokens[1] || "",
      phone: tokens[2] || "",
      owner: tokens[3] || "",
    };

    results.push(contact);
  });

  return results;
}
