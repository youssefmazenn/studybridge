import { api } from './client'
import type {
  DocumentUploadInput,
  StudyDocument,
  Translation,
} from '../types/document'

export async function listDocuments(params?: {
  courseId?: number
  search?: string
}): Promise<StudyDocument[]> {
  const { data } = await api.get<StudyDocument[]>('/api/v1/documents', {
    params,
  })
  return data
}

export async function getDocument(id: number): Promise<StudyDocument> {
  const { data } = await api.get<StudyDocument>(`/api/v1/documents/${id}`)
  return data
}

export async function uploadDocument(
  input: DocumentUploadInput,
): Promise<StudyDocument> {
  const form = new FormData()
  form.append('courseId', String(input.courseId))
  form.append('title', input.title)
  form.append('originalLanguage', input.originalLanguage)
  form.append('file', input.file)
  const { data } = await api.post<StudyDocument>('/api/v1/documents', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function deleteDocument(id: number): Promise<void> {
  await api.delete(`/api/v1/documents/${id}`)
}

export async function getDocumentFile(id: number): Promise<ArrayBuffer> {
  const { data } = await api.get<ArrayBuffer>(`/api/v1/documents/${id}/download`, {
    responseType: 'arraybuffer',
  })
  return data
}

export async function downloadDocument(document: StudyDocument): Promise<void> {
  const { data } = await api.get<Blob>(`/api/v1/documents/${document.id}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = document.originalFilename
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function listTranslations(documentId: number): Promise<Translation[]> {
  const { data } = await api.get<Translation[]>(
    `/api/v1/documents/${documentId}/translations`,
  )
  return data
}

export async function createTranslation(
  documentId: number,
  targetLanguage: string,
): Promise<Translation> {
  const { data } = await api.post<Translation>(
    `/api/v1/documents/${documentId}/translations`,
    { targetLanguage },
  )
  return data
}
