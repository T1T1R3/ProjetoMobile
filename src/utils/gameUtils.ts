export const getGameColor = (title: string): string => {
  const colors = [
    "#4A90E2",
    "#50E3C2",
    "#F5A623",
    "#D0021B",
    "#7ED321",
    "#9013FE",
    "#BD10E0",
    "#8B572A",
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  return colors[sum % colors.length];
};
