exports.addDaysToDate = (date, days) => {
  var result = new Date(date.valueOf());
  result.setDate(result.getDate() + days);
  return result;
};

exports.generateShareLink = (req, shareId) => {
  return `${req.protocol}://${req.get("host")}/share/${shareId}`;
};
("");
