exports.addDaysToDate = (date, days) => {
  var result = new Date(date.valueOf());
  result.setDate(result.getDate() + days);
  return result;
};
