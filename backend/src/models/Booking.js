import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    sessionDate: {
      type: String,
      required: true,
      trim: true,
    },
    sessionTime: {
      type: String,
      required: true,
      trim: true,
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: (seats) => Array.isArray(seats) && seats.length > 0,
        message: 'Selecione ao menos um assento.',
      },
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
  },
  { timestamps: true }
)

bookingSchema.index({ eventId: 1, sessionDate: 1, sessionTime: 1 })

export default mongoose.model('Booking', bookingSchema)
