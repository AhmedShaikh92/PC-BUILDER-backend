// Calculate total system power requirement
export const calculateSystemPower = (components) => {
  let totalTDP = 0;

  components.forEach((component) => {
    if (component.category === 'CPU') {
      totalTDP += component.specs.tdp || 0;
    } else if (component.category === 'GPU') {
      totalTDP += component.specs.tdp || 0;
    }
  });

  // Add overhead for other components (RAM, SSD, motherboard, fans, etc.)
  const overheadPower = 50;
  totalTDP += overheadPower;

  // Apply 1.25 safety margin
  const requiredWattage = Math.ceil(totalTDP * 1.25);

  return requiredWattage;
};

// Get PSU wattage recommendations based on required power
export const getPSUWattageRecommendation = (requiredWattage) => {
  const standardWattages = [450, 550, 650, 750, 850, 1000, 1200];
  return standardWattages.find((w) => w >= requiredWattage) || 1200;
};

// Check if PSU has sufficient wattage
export const isPSUSufficient = (psu, requiredWattage) => {
  return psu.specs.wattage >= requiredWattage;
};

// Compare PSU efficiency ratings
export const comparePSUEfficiency = (rating1, rating2) => {
  const efficiencyOrder = ['Standard', '80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium'];
  const index1 = efficiencyOrder.indexOf(rating1) || 0;
  const index2 = efficiencyOrder.indexOf(rating2) || 0;
  return index1 >= index2 ? rating1 : rating2;
};
