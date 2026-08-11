import mongoose from 'mongoose'

const SEED_KEY = 'default'

const seedFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: SEED_KEY,
    },
    executedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export { SEED_KEY }
export default mongoose.model('SeedFlag', seedFlagSchema)
