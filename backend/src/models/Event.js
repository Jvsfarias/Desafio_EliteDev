import mongoose from 'mongoose'

const EVENT_TYPES = ['filme', 'show']

const sessionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (times) => Array.isArray(times) && times.length > 0,
        message: 'Cada sessão precisa de ao menos um horário.',
      },
    },
  },
  { _id: false }
)

const seatMapSchema = new mongoose.Schema(
  {
    rows: {
      type: Number,
      required: true,
      min: 1,
    },
    cols: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
)

const eventSchema = new mongoose.Schema(
  {
    catalogItemId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: EVENT_TYPES,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: String,
      trim: true,
      default: '',
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    seatMap: {
      type: seatMapSchema,
      required: function requiredSeatMap() {
        return this.type === 'filme'
      },
    },
    sessions: {
      type: [sessionSchema],
      required: function requiredSessions() {
        return this.type === 'filme'
      },
      validate: {
        validator(sessions) {
          if (this.type !== 'filme') return true
          return Array.isArray(sessions) && sessions.length > 0
        },
        message: 'Informe ao menos uma sessão.',
      },
    },
    capacity: {
      type: Number,
      min: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export { EVENT_TYPES }
export default mongoose.model('Event', eventSchema)
