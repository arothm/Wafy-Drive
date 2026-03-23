import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { DriveItem } from './models/DriveItem'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const upload = multer({ dest: path.join(UPLOAD_DIR, 'tmp') })
const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const { parentId = null } = req.query
    const filter: Record<string, any> = { userId: req.user!.userId, parentId: parentId || null }
    const items = await DriveItem.find(filter).sort({ type: -1, name: 1 })
    res.json({ success: true, data: items })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await DriveItem.findOne({ _id: req.params.id, userId: req.user!.userId })
    if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return }
    res.json({ success: true, data: item })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.post('/folder', async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body
    if (!name) { res.status(400).json({ success: false, error: 'name is required' }); return }
    const folder = await DriveItem.create({ userId: req.user!.userId, name, type: 'folder', parentId: parentId || null })
    res.status(201).json({ success: true, data: folder })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return }
    const userDir = path.join(UPLOAD_DIR, req.user!.userId)
    fs.mkdirSync(userDir, { recursive: true })

    const uuid = crypto.randomUUID()
    const storageName = `${uuid}-${req.file.originalname}`
    const storagePath = path.join(userDir, storageName)
    fs.renameSync(req.file.path, storagePath)

    const item = await DriveItem.create({
      userId: req.user!.userId, name: req.file.originalname, type: 'file',
      mimeType: req.file.mimetype, size: req.file.size,
      parentId: req.body.parentId || null, storagePath,
    })
    res.status(201).json({ success: true, data: item })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.patch('/:id/rename', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    if (!name) { res.status(400).json({ success: false, error: 'name is required' }); return }
    const item = await DriveItem.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, { name }, { new: true })
    if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return }
    res.json({ success: true, data: item })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.patch('/:id/move', async (req: Request, res: Response) => {
  try {
    const { parentId } = req.body
    const item = await DriveItem.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, { parentId: parentId || null }, { new: true })
    if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return }
    res.json({ success: true, data: item })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const item = await DriveItem.findOne({ _id: req.params.id, userId: req.user!.userId, type: 'file' })
    if (!item || !item.storagePath) { res.status(404).json({ success: false, error: 'File not found' }); return }
    res.download(item.storagePath, item.name)
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await DriveItem.findOne({ _id: req.params.id, userId: req.user!.userId })
    if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return }

    if (item.type === 'folder') {
      const children = await DriveItem.find({ userId: req.user!.userId, parentId: item._id as string })
      for (const child of children) {
        if (child.type === 'file' && child.storagePath) {
          try { fs.unlinkSync(child.storagePath) } catch {}
        }
      }
      await DriveItem.deleteMany({ userId: req.user!.userId, parentId: item._id as string })
    } else if (item.storagePath) {
      try { fs.unlinkSync(item.storagePath) } catch {}
    }

    await DriveItem.findByIdAndDelete(item._id)
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, error: 'Internal server error' }) }
})

export { router as driveRouter }
