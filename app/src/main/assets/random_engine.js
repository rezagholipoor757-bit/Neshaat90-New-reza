
/* Neshaat90 - Random Engine V3 */
(function (root) {
  "use strict";

  function generate(options) {
    const cfg = options || {};
    const games = cfg.games || Array.from(
      { length: cfg.gameCount || 15 },
      (_, i) => ({ number: i + 1, active: true })
    );

    const active = games
      .map((g, i) => ({ game: g, index: i }))
      .filter(x => x.game.active !== false);

    const count = Math.max(1, Math.min(300, Number(cfg.count) || 30));
    const min = Math.max(1, Number(cfg.minAmount) || 1);
    const max = Math.max(min, Number(cfg.maxAmount) || 18);

    let p = cfg.percentages || {};
    let percentages = [
      Number(p.home ?? 45),
      Number(p.draw ?? 30),
      Number(p.away ?? 25)
    ];

    if (percentages.some(x => !Number.isFinite(x) || x < 0) ||
        percentages.reduce((a, b) => a + b, 0) <= 0) {
      throw new Error("درصدهای ۱، X و ۲ معتبر نیستند.");
    }

    const total = percentages.reduce((a, b) => a + b, 0);
    percentages = percentages.map(x => x / total);

    if (active.length < 1 || active.length > 20) {
      throw new Error("تعداد بازی‌های فعال باید بین ۱ تا ۲۰ باشد.");
    }

    if (min > Math.pow(3, active.length)) {
      throw new Error("حداقل مبلغ انتخاب‌شده قابل ساخت نیست.");
    }

    const outcomes = ["1", "X", "2"];
    const balance = [0, 0, 0];
    const target = [0, 0, 0];
    const rows = [];
    const seen = new Set();

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    // انتخاب تعداد تیک‌ها با رعایت مبلغ ضربی
    function makeModes() {
      for (let attempt = 0; attempt < 1500; attempt++) {
        const modes = active.map(() => 1);
        let price = 1;

        const order = shuffle(active.map((_, i) => i));

        for (const i of order) {
          const choices = shuffle([1, 2, 3]);
          for (const n of choices) {
            const nextPrice = price * n;
            if (nextPrice <= max) {
              modes[i] = n;
              price = nextPrice;
              break;
            }
          }
        }

        if (price >= min && price <= max) {
          return { modes, price };
        }
      }
      return null;
    }

    // انتخاب ۱، مساوی و ۲ بر اساس درصدهای هدف
    function chooseTicks(number) {
      const selected = [];

      for (let k = 0; k < number; k++) {
        const available = [0, 1, 2].filter(x => !selected.includes(x));

        available.sort((a, b) => {
          const scoreA = target[a] - balance[a] + Math.random() * 0.15;
          const scoreB = target[b] - balance[b] + Math.random() * 0.15;
          return scoreB - scoreA;
        });

        selected.push(available[0]);
      }

      selected.forEach(x => {
        balance[x]++;
        target[x] += percentages[x];
      });

      return selected.sort((a, b) => a - b).map(x => outcomes[x]);
    }

    let attempts = 0;
    const maxAttempts = count * 500;

    while (rows.length < count && attempts < maxAttempts) {
      attempts++;

      const result = makeModes();
      if (!result) continue;

      const rowGames = [];
      const keyParts = [];

      active.forEach((item, i) => {
        const ticks = result.modes[i] === 3
          ? outcomes.slice()
          : chooseTicks(result.modes[i]);

        rowGames.push({
          gameIndex: item.index,
          number: item.game.number || item.index + 1,
          ticks: ticks
        });

        keyParts.push(ticks.join(""));
      });

      const key = keyParts.join("|");
      if (seen.has(key)) continue;

      seen.add(key);

      rows.push({
        serial: rows.length + 1,
        games: rowGames,
        amount: result.price
      });
    }

    return {
      success: true,
      method: "Random V3",
      requested: count,
      generated: rows.length,
      percentages: {
        home: percentages[0] * 100,
        draw: percentages[1] * 100,
        away: percentages[2] * 100
      },
      distribution: {
        home: balance[0],
        draw: balance[1],
        away: balance[2]
      },
      rows: rows,
      message: rows.length < count
        ? "تعداد فرم قابل ساخت کمتر از تعداد درخواستی بود."
        : "تولید فرم‌ها انجام شد."
    };
  }

  root.NeshaatRandom = {
    generate: generate
  };

})(globalThis);
