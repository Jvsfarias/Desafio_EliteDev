import mongoose from 'mongoose'
import crypto from 'crypto'

function generateCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      uppercase: true,
      default: generateCode,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
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
    eventTitle: { type: String, required: true },
    eventVenue: { type: String, default: '' },
    eventDate: { type: String, default: '' },
    eventTime: { type: String, default: '' },
    // Cinema
    seats: { type: [String], default: [] },
    sessionDate: { type: String, default: '' },
    sessionTime: { type: String, default: '' },
    // Show
    areaKey: { type: String, default: '' },
    areaLabel: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'used'],
      default: 'active',
    },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

ticketSchema.index({ userId: 1 })

export default mongoose.model('Ticket', ticketSchema)
