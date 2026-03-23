import mongoose, { Schema, Document } from 'mongoose'

export interface IDriveItem extends Document {
  userId: string
  name: string
  type: 'file' | 'folder'
  mimeType: string
  size: number
  parentId: string | null
  storagePath: string
  createdAt: Date
  updatedAt: Date
}

const driveItemSchema = new Schema<IDriveItem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    parentId: { type: String, default: null },
    storagePath: { type: String, default: '' },
  },
  { timestamps: true },
)

driveItemSchema.index({ userId: 1, parentId: 1 })

export const DriveItem = mongoose.model<IDriveItem>('DriveItem', driveItemSchema)
