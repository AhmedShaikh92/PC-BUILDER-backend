import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['CPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'GPU', 'CPU_Cooler', 'Case_Fan'],
      required: true,
    },
    brand: String,
    specs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    benchmarkScore: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'components' }
);

export default mongoose.model('Component', componentSchema);
