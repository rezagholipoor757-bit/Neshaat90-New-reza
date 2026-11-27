function generateRandomRows(games, count, percentages) {
  const results = ["1", "X", "2"];
  const sum = results.reduce(
    (s, r) => s + percentages[r], 0
  );

  if (sum !== 100) {
    throw new Error("مجموع درصدها باید ۱۰۰ باشد");
  }

  count = Math.min(300, count);
  const rows = [];
  const used = new Set();

  function pick() {
    const n = Math.random() * 100;
    if (n < percentages["1"]) return "1";
    if (n < percentages["1"] + percentages["X"]) return "X";
    return "2";
  }

  let attempts = 0;

  while (rows.length < count && attempts < count * 100) {
    attempts++;
    const row = Array.from({ length: games }, pick);
    const key = row.join("");

    if (!used.has(key)) {
      used.add(key);
      rows.push(row);
    }
  }

  return rows;
}
