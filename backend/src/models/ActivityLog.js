import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['purchase', 'cancellation', 'auto_removal', 'event_cancel', 'ticket_validation'],
      required: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorName: { type: String, default: '' },
    actorEmail: { type: String, default: '' },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    eventTitle: { type: String, default: '' },
    eventType: { type: String, default: '' },
    ticketCode: { type: String, default: '' },
    totalPrice: { type: Number, default: 0 },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    message: { type: String, required: true },
  },
  { timestamps: true }
)

activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })

export default mongoose.model('ActivityLog', activityLogSchema)
