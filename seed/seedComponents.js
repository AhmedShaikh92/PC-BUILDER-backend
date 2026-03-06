export const componentsData = [
  // === CPUs (6) ===
  { name: 'Intel Core i3-12100F',  category: 'CPU', brand: 'Intel', specs: { socket: 'LGA1700', cores: 4,  threads: 8,  tdp: 58,  integratedGraphics: false }, benchmarkScore: 14000 },
  { name: 'AMD Ryzen 5 5600X',     category: 'CPU', brand: 'AMD',   specs: { socket: 'AM4',    cores: 6,  threads: 12, tdp: 65,  integratedGraphics: false }, benchmarkScore: 22000 },
  { name: 'Intel Core i5-13600K',  category: 'CPU', brand: 'Intel', specs: { socket: 'LGA1700', cores: 14, threads: 20, tdp: 125, integratedGraphics: true  }, benchmarkScore: 38000 },
  { name: 'AMD Ryzen 7 7800X3D',   category: 'CPU', brand: 'AMD',   specs: { socket: 'AM5',    cores: 8,  threads: 16, tdp: 120, integratedGraphics: true  }, benchmarkScore: 34000 },
  { name: 'Intel Core i9-14900K',  category: 'CPU', brand: 'Intel', specs: { socket: 'LGA1700', cores: 24, threads: 32, tdp: 150, integratedGraphics: true  }, benchmarkScore: 60000 },
  { name: 'AMD Ryzen 9 7950X',     category: 'CPU', brand: 'AMD',   specs: { socket: 'AM5',    cores: 16, threads: 32, tdp: 170, integratedGraphics: true  }, benchmarkScore: 63000 },

  // === Motherboards (6) ===
  { name: 'ASRock B450M-HDV',              category: 'Motherboard', brand: 'ASRock',   specs: { socket: 'AM4',    formFactor: 'mATX', chipset: 'B450',  maxMemoryGB: 32  }, benchmarkScore: 4000  },
  { name: 'Gigabyte B660M DS3H',           category: 'Motherboard', brand: 'Gigabyte', specs: { socket: 'LGA1700', formFactor: 'mATX', chipset: 'B660',  maxMemoryGB: 64  }, benchmarkScore: 5500  },
  { name: 'MSI MAG B550 TOMAHAWK',         category: 'Motherboard', brand: 'MSI',      specs: { socket: 'AM4',    formFactor: 'ATX',  chipset: 'B550',  maxMemoryGB: 128 }, benchmarkScore: 8000  },
  { name: 'ASUS ROG STRIX Z790-E',         category: 'Motherboard', brand: 'ASUS',     specs: { socket: 'LGA1700', formFactor: 'ATX',  chipset: 'Z790',  maxMemoryGB: 192 }, benchmarkScore: 11000 },
  { name: 'Gigabyte X670E AORUS MASTER',   category: 'Motherboard', brand: 'Gigabyte', specs: { socket: 'AM5',    formFactor: 'EATX', chipset: 'X670E', maxMemoryGB: 192 }, benchmarkScore: 12500 },
  { name: 'ASRock Z790 Taichi',            category: 'Motherboard', brand: 'ASRock',   specs: { socket: 'LGA1700', formFactor: 'EATX', chipset: 'Z790',  maxMemoryGB: 192 }, benchmarkScore: 13000 },

  // === RAM (6) ===
  { name: 'Crucial Basics 8GB',              category: 'RAM', brand: 'Crucial',  specs: { sizeGB: 8,  speedMHz: 2666, type: 'DDR4', latency: 'CL19' }, benchmarkScore: 3500  },
  { name: 'Corsair Vengeance LPX 16GB',      category: 'RAM', brand: 'Corsair',  specs: { sizeGB: 16, speedMHz: 3200, type: 'DDR4', latency: 'CL16' }, benchmarkScore: 7800  },
  { name: 'G.Skill Ripjaws V 32GB',          category: 'RAM', brand: 'G.Skill',  specs: { sizeGB: 32, speedMHz: 3600, type: 'DDR4', latency: 'CL18' }, benchmarkScore: 9200  },
  { name: 'Kingston FURY Beast 16GB',        category: 'RAM', brand: 'Kingston', specs: { sizeGB: 16, speedMHz: 5200, type: 'DDR5', latency: 'CL40' }, benchmarkScore: 11000 },
  { name: 'Corsair Dominator Platinum 32GB', category: 'RAM', brand: 'Corsair',  specs: { sizeGB: 32, speedMHz: 6200, type: 'DDR5', latency: 'CL36' }, benchmarkScore: 14500 },
  { name: 'G.Skill Trident Z5 RGB 64GB',     category: 'RAM', brand: 'G.Skill',  specs: { sizeGB: 64, speedMHz: 6400, type: 'DDR5', latency: 'CL32' }, benchmarkScore: 18000 },

  // === Storage (6) ===
  { name: 'Kingston A400 240GB',  category: 'Storage', brand: 'Kingston',        specs: { type: 'SSD', capacityGB: 240,  interface: 'SATA III'   }, benchmarkScore: 2500  },
  { name: 'Seagate BarraCuda 2TB', category: 'Storage', brand: 'Seagate',        specs: { type: 'HDD', capacityGB: 2000, interface: 'SATA III'   }, benchmarkScore: 1500  },
  { name: 'Crucial P3 1TB',       category: 'Storage', brand: 'Crucial',         specs: { type: 'SSD', capacityGB: 1000, interface: 'NVMe Gen3'  }, benchmarkScore: 8500  },
  { name: 'Samsung 980 Pro 1TB',  category: 'Storage', brand: 'Samsung',         specs: { type: 'SSD', capacityGB: 1000, interface: 'NVMe Gen4'  }, benchmarkScore: 14000 },
  { name: 'WD Black SN850X 2TB',  category: 'Storage', brand: 'Western Digital', specs: { type: 'SSD', capacityGB: 2000, interface: 'NVMe Gen4'  }, benchmarkScore: 16500 },
  { name: 'Crucial T700 2TB',     category: 'Storage', brand: 'Crucial',         specs: { type: 'SSD', capacityGB: 2000, interface: 'NVMe Gen5'  }, benchmarkScore: 22000 },

  // === GPU (6) ===
  { name: 'NVIDIA GeForce GTX 1650',      category: 'GPU', brand: 'NVIDIA', specs: { tdp: 75,  lengthMM: 158, vramGB: 4  }, benchmarkScore: 7800  },
  { name: 'AMD Radeon RX 6600',           category: 'GPU', brand: 'AMD',   specs: { tdp: 132, lengthMM: 190, vramGB: 8  }, benchmarkScore: 14500 },
  { name: 'NVIDIA GeForce RTX 3060 Ti',   category: 'GPU', brand: 'NVIDIA', specs: { tdp: 200, lengthMM: 242, vramGB: 8  }, benchmarkScore: 20000 },
  { name: 'AMD Radeon RX 7800 XT',        category: 'GPU', brand: 'AMD',   specs: { tdp: 263, lengthMM: 267, vramGB: 16 }, benchmarkScore: 28000 },
  { name: 'NVIDIA GeForce RTX 4080 Super', category: 'GPU', brand: 'NVIDIA', specs: { tdp: 320, lengthMM: 310, vramGB: 16 }, benchmarkScore: 34000 },
  { name: 'NVIDIA GeForce RTX 4090',      category: 'GPU', brand: 'NVIDIA', specs: { tdp: 450, lengthMM: 336, vramGB: 24 }, benchmarkScore: 45000 },

  // === PSU (6) ===
  { name: 'Thermaltake Smart 500W',          category: 'PSU', brand: 'Thermaltake', specs: { wattage: 500,  rating: '80+ White',    modular: 'None' }, benchmarkScore: 3000  },
  { name: 'EVGA 600 BR',                     category: 'PSU', brand: 'EVGA',        specs: { wattage: 600,  rating: '80+ Bronze',   modular: 'None' }, benchmarkScore: 5000  },
  { name: 'Corsair RM750e',                  category: 'PSU', brand: 'Corsair',     specs: { wattage: 750,  rating: '80+ Gold',     modular: 'Full' }, benchmarkScore: 8500  },
  { name: 'Seasonic Focus GX-850',           category: 'PSU', brand: 'Seasonic',    specs: { wattage: 850,  rating: '80+ Gold',     modular: 'Full' }, benchmarkScore: 9200  },
  { name: 'be quiet! Straight Power 12 1000W', category: 'PSU', brand: 'be quiet!', specs: { wattage: 1000, rating: '80+ Platinum', modular: 'Full' }, benchmarkScore: 10000 },
  { name: 'Corsair AX1600i',                 category: 'PSU', brand: 'Corsair',     specs: { wattage: 1600, rating: '80+ Titanium', modular: 'Full' }, benchmarkScore: 12000 },

  // === Case (6) ===
  { name: 'Cooler Master Q300L',    category: 'Case', brand: 'Cooler Master',   specs: { formFactorsSupported: ['mATX', 'ITX'],        maxGPULengthMM: 360, cpuCoolerMaxHeight: 159 }, benchmarkScore: 5000 },
  { name: 'NZXT H5 Flow',           category: 'Case', brand: 'NZXT',            specs: { formFactorsSupported: ['ATX', 'mATX'],         maxGPULengthMM: 365, cpuCoolerMaxHeight: 165 }, benchmarkScore: 8200 },
  { name: 'Corsair 4000D Airflow',  category: 'Case', brand: 'Corsair',         specs: { formFactorsSupported: ['ATX', 'mATX'],         maxGPULengthMM: 360, cpuCoolerMaxHeight: 170 }, benchmarkScore: 8800 },
  { name: 'Lian Li O11 Dynamic EVO', category: 'Case', brand: 'Lian Li',        specs: { formFactorsSupported: ['ATX', 'EATX', 'mATX'], maxGPULengthMM: 426, cpuCoolerMaxHeight: 167 }, benchmarkScore: 9500 },
  { name: 'Fractal Design North',   category: 'Case', brand: 'Fractal Design',  specs: { formFactorsSupported: ['ATX', 'mATX'],         maxGPULengthMM: 355, cpuCoolerMaxHeight: 170 }, benchmarkScore: 9000 },
  { name: 'Phanteks NV7',           category: 'Case', brand: 'Phanteks',        specs: { formFactorsSupported: ['ATX', 'EATX', 'mATX'], maxGPULengthMM: 450, cpuCoolerMaxHeight: 185 }, benchmarkScore: 9800 },

  // === CPU Cooler (6) ===
  { name: 'Intel Stock Cooler',                 category: 'CPU_Cooler', brand: 'Intel',        specs: { type: 'Air',    tdpRating: 65,  heightMM: 47         }, benchmarkScore: 2000  },
  { name: 'Cooler Master Hyper 212 Halo',       category: 'CPU_Cooler', brand: 'Cooler Master', specs: { type: 'Air',    tdpRating: 180, heightMM: 154        }, benchmarkScore: 6500  },
  { name: 'DeepCool AK620',                     category: 'CPU_Cooler', brand: 'DeepCool',     specs: { type: 'Air',    tdpRating: 260, heightMM: 160        }, benchmarkScore: 8800  },
  { name: 'Noctua NH-D15 chromax.black',        category: 'CPU_Cooler', brand: 'Noctua',       specs: { type: 'Air',    tdpRating: 250, heightMM: 165        }, benchmarkScore: 9500  },
  { name: 'NZXT Kraken 240',                    category: 'CPU_Cooler', brand: 'NZXT',         specs: { type: 'Liquid', tdpRating: 250, radiatorSizeMM: 240  }, benchmarkScore: 9800  },
  { name: 'Arctic Liquid Freezer III 360',      category: 'CPU_Cooler', brand: 'Arctic',       specs: { type: 'Liquid', tdpRating: 300, radiatorSizeMM: 360  }, benchmarkScore: 11500 },

  // === Case Fan (6) ===
  { name: 'Arctic P12 PWM',        category: 'Case_Fan', brand: 'Arctic',         specs: { sizeMM: 120, airflowCFM: 56, noiseDB: 22 }, benchmarkScore: 7000  },
  { name: 'Noctua NF-A12x25',      category: 'Case_Fan', brand: 'Noctua',         specs: { sizeMM: 120, airflowCFM: 60, noiseDB: 22 }, benchmarkScore: 9500  },
  { name: 'Corsair LL120 RGB',      category: 'Case_Fan', brand: 'Corsair',        specs: { sizeMM: 120, airflowCFM: 43, noiseDB: 24 }, benchmarkScore: 8000  },
  { name: 'Lian Li Uni Fan SL120',  category: 'Case_Fan', brand: 'Lian Li',       specs: { sizeMM: 120, airflowCFM: 58, noiseDB: 31 }, benchmarkScore: 9000  },
  { name: 'Phanteks T30-120',       category: 'Case_Fan', brand: 'Phanteks',       specs: { sizeMM: 120, airflowCFM: 67, noiseDB: 27 }, benchmarkScore: 10000 },
];