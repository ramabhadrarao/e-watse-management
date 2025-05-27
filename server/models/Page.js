import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // JSON content blocks
    required: true
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: Date,
  template: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: true
});

// Create slug from title if not provided
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }

  // If status changes to published, set publishedAt
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  next();
});

export default mongoose.model('Page', pageSchema);