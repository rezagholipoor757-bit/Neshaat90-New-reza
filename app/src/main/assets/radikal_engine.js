
/* Neshaat90 - Radikal Engine V2 */
(function (root) {
  "use strict";

  function normalizeConditions(conditions, gameCount) {
    if (!Array.isArray(conditions) ||
        conditions.length < 1 ||
        conditions.length > 3) {
      throw new Error("رادیکال باید بین ۱ تا ۳ شرط داشته باشد.");
    }

    return conditions.map((condition, index) => {
      const games = [...new Set(
        (condition.games || []).map(Number)
      )];

      const exactCorrect = Number(condition.exactCorrect);

      if (!games.length) {
        throw new Error("شرط " + (index + 1) + " بازی ندارد.");
      }

      if (games.some(n =>
        !Number.isInteger(n) || n < 1 || n > gameCount
      )) {
        throw new Error("شماره بازی در شرط معتبر نیست.");
      }

      if (!Number.isInteger(exactCorrect) ||
          exactCorrect < 0 ||
          exactCorrect > games.length) {
        throw new Error("تعداد صحیح شرط معتبر نیست.");
      }

      return { games, exactCorrect };
    });
  }

  function evaluate(form, results, conditions) {
    if (!Array.isArray(form) || !Array.isArray(results)) {
      throw new Error("اطلاعات فرم یا نتایج معتبر نیست.");
    }

    const normalized = normalizeConditions(
      conditions, results.length
    );

    const details = normalized.map((condition, index) => {
      let correct = 0;

      condition.games.forEach(gameNumber => {
        const i = gameNumber - 1;
        const prediction = form[i];
        const result = results[i];

        if (Array.isArray(prediction)) {
          if (prediction.includes(result)) correct++;
        } else if (prediction === result) {
          correct++;
        }
      });

      return {
        condition: index + 1,
        games: condition.games.length,
        correct: correct,
        required: condition.exactCorrect,
        passed: correct === condition.exactCorrect
      };
    });

    return {
      passed: details.every(x => x.passed),
      details: details
    };
  }

  function filterForms(forms, results, conditions) {
    return forms.filter(form =>
      evaluate(form, results, conditions).passed
    );
  }

  function validateConditions(conditions, gameCount) {
    const normalized = normalizeConditions(
      conditions, gameCount
    );

    return {
      valid: true,
      conditionCount: normalized.length,
      conditions: normalized
    };
  }

  root.NeshaatRadikal = {
    evaluate: evaluate,
    filterForms: filterForms,
    validateConditions: validateConditions
  };

})(globalThis);
