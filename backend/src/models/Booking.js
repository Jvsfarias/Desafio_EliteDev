import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // Cinema
    sessionDate: {
      type: String,
      trim: true,
      default: '',
    },
    sessionTime: {
      type: String,
      trim: true,
      default: '',
    },
    seats: {
      type: [String],
      default: [],
    },
    // Show
    areaKey: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

bookingSchema.index({ eventId: 1, sessionDate: 1, sessionTime: 1 })
bookingSchema.index({ eventId: 1, areaKey: 1 })

export default mongoose.model('Booking', bookingSchema)
