/* Neshaat 90 - Radikal Engine
   پشتیبانی از حالت تک‌شرطی، دوشرطی و سه‌شرطی
*/

const RADIKAL_MODES = {
  single: 1,
  double: 2,
  triple: 3
};

// بررسی تعداد پیش‌بینی‌های صحیح در هر شرط
function checkRadikalCondition(row, results, condition) {
  const correct = condition.games.filter(index =>
    row[index] === results[index]
  ).length;

  return correct === condition.exactCorrect;
}

// بررسی یک فرم بر اساس شرط‌ها
function checkRadikalRow(row, results, conditions) {
  if (!Array.isArray(row) || !Array.isArray(results)) {
    throw new Error("اطلاعات فرم یا نتایج معتبر نیست");
  }

  if (row.length !== results.length) {
    throw new Error("تعداد بازی‌های فرم و نتایج برابر نیست");
  }

  return conditions.every(condition =>
    checkRadikalCondition(row, results, condition)
  );
}

// تعیین نوع رادیکالی
function getRadikalMode(conditions) {
  if (!Array.isArray(conditions) ||
      conditions.length < 1 ||
      conditions.length > 3) {
    throw new Error("تعداد شرط‌ها باید بین ۱ تا ۳ باشد");
  }

  return ["single", "double", "triple"][conditions.length - 1];
}

// خروجی بررسی
function evaluateRadikal(rows, results, conditions) {
  const mode = getRadikalMode(conditions);

  const accepted = rows.filter(row =>
    checkRadikalRow(row, results, conditions)
  );

  return {
    mode,
    total: rows.length,
    acceptedCount: accepted.length,
    rejectedCount: rows.length - accepted.length,
    accepted
  };
}

// قابل استفاده در برنامه
if (typeof module !== "undefined") {
  module.exports = {
    RADIKAL_MODES,
    checkRadikalCondition,
    checkRadikalRow,
    getRadikalMode,
    evaluateRadikal
  };
    }
