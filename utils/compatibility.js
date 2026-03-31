// Check CPU and Motherboard socket compatibility
export const isCPUMotherboardCompatible = (cpu, motherboard) => {
  return cpu.specs.socket === motherboard.specs.socket;
};

// Check if GPU fits in case
export const isGPUFitsInCase = (gpu, pcCase) => {
  if (!gpu || !pcCase) return true;
  return gpu.specs.lengthMM <= pcCase.specs.maxGPULengthMM;
};

// Check if motherboard form factor is supported by case
export const isMotherboardFitsInCase = (motherboard, pcCase) => {
  if (!motherboard || !pcCase) return true;
  return pcCase.specs.formFactorsSupported.includes(motherboard.specs.formFactor);
};

// Check if CPU cooler fits in case
export const isCoolerFitsInCase = (cooler, pcCase) => {
  if (!cooler || !pcCase) return true;
  const maxHeight = pcCase.specs.cpuCoolerMaxHeight || 200; // default fallback
  return cooler.specs.heightMM <= maxHeight;
};

// Validate all components in a build for compatibility
export const validateBuildCompatibility = (components) => {
  const errors = [];

  const cpu = components.find((c) => c.category === 'CPU');
  const motherboard = components.find((c) => c.category === 'Motherboard');
  const gpu = components.find((c) => c.category === 'GPU');
  const pcCase = components.find((c) => c.category === 'Case');
  const cooler = components.find((c) => c.category === 'CPU_Cooler');

  if (cpu && motherboard && !isCPUMotherboardCompatible(cpu, motherboard)) {
    errors.push(`CPU socket ${cpu.specs.socket} does not match motherboard socket ${motherboard.specs.socket}`);
  }

  if (gpu && pcCase && !isGPUFitsInCase(gpu, pcCase)) {
    errors.push(`GPU length ${gpu.specs.lengthMM}mm exceeds case max ${pcCase.specs.maxGPULengthMM}mm`);
  }

  if (motherboard && pcCase && !isMotherboardFitsInCase(motherboard, pcCase)) {
    errors.push(`Motherboard form factor ${motherboard.specs.formFactor} not supported by case`);
  }

  if (cooler && pcCase && !isCoolerFitsInCase(cooler, pcCase)) {
    errors.push(`CPU cooler height ${cooler.specs.heightMM}mm exceeds case max height`);
  }

  return errors;
};
