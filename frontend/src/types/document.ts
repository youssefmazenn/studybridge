export type StudyDocument = {
  id: number
  courseId: number
  courseCode: string
  courseTitle: string
  title: string
  originalFilename: string
  contentType: string
  fileSize: number
  originalLanguage: string
  extractedText: string | null
  pageTexts: string[] | null
  pageCount: number
  uploadDate: string
}

export type DocumentUploadInput = {
  courseId: number
  title: string
  originalLanguage: string
  file: File
}

export type Translation = {
  id: number
  documentId: number
  targetLanguage: string
  translatedText: string
  translatedPages: string[] | null
  simplifiedText: string
  simplifiedPages: string[] | null
  createdAt: string
}
