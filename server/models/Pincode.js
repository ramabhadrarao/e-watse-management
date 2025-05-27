import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  isServiceable: {
    type: Boolean,
    default: true
  },
  pickupCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumOrderValue: {
    type: Number,
    default: 100,
    min: 0
  },
  estimatedPickupTime: {
    type: String,
    default: '24-48 hours'
  },
  assignedPickupBoys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  coordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  }
}, {
  timestamps: true
});

// Index for faster searches
pincodeSchema.index({ pincode: 1 });
pincodeSchema.index({ city: 1, state: 1 });

export default mongoose.model('Pincode', pincodeSchema);