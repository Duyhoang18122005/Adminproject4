// Utility functions for charts
export const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F9E79F', '#ABEBC6', '#FAD7A0', '#AED6F1', '#D5A6BD',
    '#A9CCE3', '#F5B7B1', '#D2B4DE', '#A3E4D7', '#F8C471',
    '#85C1E9', '#F1948A', '#D7BDE2', '#F9E79F', '#ABEBC6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate random colors for chart data
export const generateRandomColorsForData = (data) => {
  const colorMap = {};
  data.forEach(item => {
    if (!colorMap[item.name]) {
      colorMap[item.name] = generateRandomColor();
    }
  });
  return colorMap;
};

// Apply random colors to chart data
export const applyRandomColorsToData = (data) => {
  const colorMap = generateRandomColorsForData(data);
  return data.map(item => ({
    ...item,
    itemStyle: { color: colorMap[item.name] || generateRandomColor() }
  }));
}; 