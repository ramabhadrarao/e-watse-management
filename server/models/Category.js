import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true // Icon name for frontend
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'piece', 'set'],
    default: 'piece'
  },
  conditionMultipliers: {
    excellent: {
      type: Number,
      default: 1.0
    },
    good: {
      type: Number,
      default: 0.8
    },
    fair: {
      type: Number,
      default: 0.6
    },
    poor: {
      type: Number,
      default: 0.4
    },
    broken: {
      type: Number,
      default: 0.2
    }
  },
  subcategories: [{
    name: String,
    priceModifier: Number // Multiplier for base price
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', categorySchema);