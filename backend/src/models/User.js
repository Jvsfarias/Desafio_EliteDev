import mongoose from 'mongoose'

const ROLES = ['cliente', 'organizador', 'portaria']

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'cliente',
    },
  },
  { timestamps: true }
)

export { ROLES }
export default mongoose.model('User', userSchema)
