import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderPlus, Upload, Home, Folder, File, Download, Trash2, Edit, ArrowRight, Grid3X3, List } from 'lucide-react'
import { driveApi } from '@wafy/core'
import { Button, Card, Modal, Input, Spinner } from '@wafy/ui'
import { formatFileSize, formatRelativeTime } from '@wafy/utils'

interface DriveItem {
  _id: string; name: string; type: 'file' | 'folder'; mimeType: string; size: number
  parentId: string | null; createdAt: string; updatedAt: string
}

export default function DrivePage() {
  const { t } = useTranslation('drive')
  const [items, setItems] = useState<DriveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [parentId, setParentId] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Home' }])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [renameItem, setRenameItem] = useState<DriveItem | null>(null)
  const [renameName, setRenameName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await driveApi.list(parentId ? { parentId } : {})
    if (res.success) setItems(res.data)
    setLoading(false)
  }, [parentId])

  useEffect(() => { load() }, [load])

  const openFolder = (item: DriveItem) => {
    setParentId(item._id)
    setBreadcrumb([...breadcrumb, { id: item._id, name: item.name }])
  }

  const navigateTo = (index: number) => {
    const bc = breadcrumb.slice(0, index + 1)
    setBreadcrumb(bc)
    setParentId(bc[bc.length - 1].id)
  }

  const createFolder = async () => {
    if (!folderName) return
    await driveApi.createFolder({ name: folderName, parentId })
    setFolderName(''); setShowNewFolder(false); load()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    if (parentId) formData.append('parentId', parentId)
    await driveApi.upload(formData)
    load()
    e.target.value = ''
  }

  const handleRename = async () => {
    if (!renameItem || !renameName) return
    await driveApi.rename(renameItem._id, renameName)
    setRenameItem(null); load()
  }

  const handleDownload = (item: DriveItem) => {
    window.open(`/api/drive/${item._id}/download`, '_blank')
  }

  const handleDelete = async (item: DriveItem) => {
    await driveApi.delete(item._id)
    load()
  }

  const getIcon = (item: DriveItem) => {
    if (item.type === 'folder') return <Folder size={40} className="text-gold-500" />
    return <File size={40} className="text-neutral-400" />
  }

  if (loading && items.length === 0) return <div className="flex items-center justify-center h-screen"><Spinner /></div>

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb.map((bc, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ArrowRight size={12} className="text-neutral-400" />}
              <button onClick={() => navigateTo(i)} className={`hover:text-gold-600 ${i === breadcrumb.length - 1 ? 'font-bold' : 'text-neutral-500'}`}>
                {i === 0 ? <Home size={16} /> : bc.name}
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNewFolder(true)}><FolderPlus size={16} className="mr-1" />{t('newFolder', 'New Folder')}</Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}><Upload size={16} className="mr-1" />{t('upload', 'Upload')}</Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <Folder size={48} className="mb-2" />
            <p>{t('emptyFolder', 'This folder is empty')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {items.map((item) => (
              <Card key={item._id} className="p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 group"
                onClick={() => item.type === 'folder' ? openFolder(item) : handleDownload(item)}>
                {getIcon(item)}
                <span className="text-xs text-center truncate w-full">{item.name}</span>
                {item.type === 'file' && <span className="text-[10px] text-neutral-400">{formatFileSize(item.size)}</span>}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setRenameItem(item); setRenameName(item.name) }} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"><Edit size={12} /></button>
                  {item.type === 'file' && <button onClick={(e) => { e.stopPropagation(); handleDownload(item) }} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"><Download size={12} /></button>}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item) }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"><Trash2 size={12} /></button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item._id} onClick={() => item.type === 'folder' ? openFolder(item) : handleDownload(item)}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer group">
                {item.type === 'folder' ? <Folder size={20} className="text-gold-500" /> : <File size={20} className="text-neutral-400" />}
                <span className="flex-1 text-sm truncate">{item.name}</span>
                {item.type === 'file' && <span className="text-xs text-neutral-400">{formatFileSize(item.size)}</span>}
                <span className="text-xs text-neutral-400">{formatRelativeTime(item.updatedAt)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); setRenameItem(item); setRenameName(item.name) }} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"><Edit size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item) }} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New folder modal */}
      <Modal open={showNewFolder} onClose={() => setShowNewFolder(false)} title={t('newFolder', 'New Folder')}>
        <Input placeholder={t('folderName', 'Folder name')} value={folderName} onChange={(e) => setFolderName(e.target.value)} autoFocus />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setShowNewFolder(false)}>{t('cancel', 'Cancel')}</Button>
          <Button onClick={createFolder}>{t('create', 'Create')}</Button>
        </div>
      </Modal>

      {/* Rename modal */}
      <Modal open={!!renameItem} onClose={() => setRenameItem(null)} title={t('rename', 'Rename')}>
        <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} autoFocus />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => setRenameItem(null)}>{t('cancel', 'Cancel')}</Button>
          <Button onClick={handleRename}>{t('save', 'Save')}</Button>
        </div>
      </Modal>
    </div>
  )
}
