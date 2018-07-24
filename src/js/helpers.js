export const colors = {
  "dark-red": "#f44336", // > 2
  "light-red": "#ef9a9a", // > 1
  "light-blue": "#6ec6ff", // > 0.5
  "dark-blue": "#1565c0", // < 0.5
  red: "#f44336", // aegypti
  green: "#4caf50", // surveillance
  blue: "#2196f3", //albopictus
  orange: "#ff9800",
  gray: "#9e9e9e",
  yellow: "#ffeb3b",
  cyan: "#62efff",
  pink: "#e91e63",
  purple: "#9c27b0",
  indigo: "#3f51b5",
  "deep-purple": "#673ab7",
  teal: "#009688",
  amber: "#ffc107"
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
