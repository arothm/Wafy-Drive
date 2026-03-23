import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createAuthMiddleware } from '@wafy/utils/server'
import { driveRouter } from './routes'
import fs from "fs"

const app = express()
const PORT = process.env.PORT || 3007
const SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-secret'

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5179', credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(createAuthMiddleware(SECRET))
app.use('/', driveRouter)
app.get('/health', (_req, res) => { res.json({ status: 'ok', service: 'drive' }) })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wafy_drive'

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log('`Drive backend running on port ${PORT}`'))
}).catch((err) => { console.error('MongoDB connection error:', err); process.exit(1) })
