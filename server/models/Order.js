import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // Removed required: true since we'll generate it in pre-save
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategory: String,
    brand: String,
    model: String,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'broken'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    images: [String], // URLs
    description: String
  }],
  pickupDetails: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: String
    },
    preferredDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    specialInstructions: String
  },
  status: {
    type: String,
    enum: [
      'pending',      // Order placed, waiting for confirmation
      'confirmed',    // Order confirmed, pickup scheduled
      'assigned',     // Pickup boy assigned
      'in_transit',   // Pickup boy on the way
      'picked_up',    // Items picked up
      'processing',   // Items being evaluated
      'completed',    // Order completed, payment processed
      'cancelled'     // Order cancelled
    ],
    default: 'pending'
  },
  assignedPickupBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinVerification: {
    pin: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },
  pricing: {
    estimatedTotal: {
      type: Number,
      required: true
    },
    actualTotal: {
      type: Number,
      default: 0
    },
    pickupCharges: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      default: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }]
}, {
  timestamps: true
});

// Generate order number and PIN before saving
orderSchema.pre('save', async function(next) {
  // Only generate for new documents
  if (this.isNew) {
    try {
      // Generate unique order number
      const count = await this.constructor.countDocuments();
      this.orderNumber = `EW${String(count + 1).padStart(6, '0')}`;
      
      // Generate PIN for verification (6 digits)
      this.pinVerification = {
        pin: Math.floor(100000 + Math.random() * 900000).toString(),
        isVerified: false
      };
      
      // Initialize timeline with first entry
      this.timeline = [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created'
      }];
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);