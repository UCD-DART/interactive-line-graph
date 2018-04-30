export const colors = {
  "dark-red": "#f44336", // > 2
  "light-red": "#ef9a9a", // > 1
  "light-blue": "#6ec6ff", // > 0.5
  "dark-blue": "#1565c0" // < 0.5
};

export const labelZikaRisk = num => {
  if (num >= 2.0) {
    return colors["dark-red"];
  } else if (num >= 1.0) {
    return colors["light-red"];
  } else if (num >= 0.5) {
    return colors["light-blue"];
  } else return colors["dark-blue"];
};
