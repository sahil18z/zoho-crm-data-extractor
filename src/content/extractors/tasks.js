export function tasks() {
  const links = Array.from(
    document.querySelectorAll('a[id^="listView_"]')
  );

  const seen = new Set();
  const tasks = [];

  links.forEach((link) => {
    const id = link.id.replace("listView_", "");
    if (!id || seen.has(id)) return;
    seen.add(id);

    const row =
      link.closest('[role="row"]') ||
      link.closest('lyte-exptable-tr') ||
      link.closest('tr') ||
      link.closest('div');

    if (!row) return;

    const text = row.innerText
      .split("\n")
      .flatMap(t => t.split("\t"))
      .map(t => t.trim())
      .filter(Boolean);

    const subject = link.innerText.trim();

    const dueDate = text.find(t =>
      /\d{2}\/\d{2}\/\d{4}/.test(t)
    ) || "";

    const status =
      ["Completed", "Not Started", "In Progress", "Deferred"]
        .find(s => text.includes(s)) || "";

    const priority =
      ["Highest", "High", "Normal", "Low"]
        .find(p => text.includes(p)) || "";

    // Extract Sample names
    const sampleNames = text.filter(t => /\(Sample\)$/.test(t));

    // Related To = first Sample (Account / Deal)
    const relatedTo = sampleNames[0] || "";

    // Contact = second Sample (Contact)
    const contact = sampleNames[1] || "";

    tasks.push({
      id,
      subject,
      dueDate,
      status,
      priority,
      relatedTo,
      contact,
    });
  });

  return tasks;
}
