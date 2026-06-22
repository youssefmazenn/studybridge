import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ArrowLeft, Download, Languages, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Document as PdfDocument, Page as PdfPage, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import * as documentApi from '../api/documentApi'
import { getErrorMessage } from '../api/errors'
import { useLanguage } from '../context/LanguageContext'
import { ErrorAlert } from '../components/ErrorAlert'
import { Spinner } from '../components/Spinner'
import type { StudyDocument, Translation } from '../types/document'

// Render the pdf.js parsing worker from the bundled distribution (Vite resolves this URL).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type RightMode = 'translation' | 'simplified'

const languageOptions = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Arabic',
  'Turkish',
  'Portuguese',
  'Dutch',
  'Polish',
]

const TWO_COLUMN_BREAKPOINT = 880
const COLUMN_GAP = 24

/** Tracks the content-box width of an element so PDF pages can be sized to their column. */
function useContentWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0
      if (next > 0) setWidth(next)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

function isPdfDocument(doc: StudyDocument): boolean {
  return (
    doc.contentType === 'application/pdf' ||
    doc.originalFilename.toLowerCase().endsWith('.pdf')
  )
}

export function DocumentDetailPage() {
  const { t } = useLanguage()
  const { id } = useParams()
  const documentId = Number(id)
  const [document, setDocument] = useState<StudyDocument | null>(null)
  const [translations, setTranslations] = useState<Translation[]>([])
  const [targetLanguage, setTargetLanguage] = useState('English')
  const [rightMode, setRightMode] = useState<RightMode>('translation')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pdfError, setPdfError] = useState('')

  const [columnsRef, columnsWidth] = useContentWidth<HTMLDivElement>()

  const load = useCallback(async () => {
    if (!Number.isFinite(documentId)) return
    setLoading(true)
    setError('')
    try {
      const [doc, translationList] = await Promise.all([
        documentApi.getDocument(documentId),
        documentApi.listTranslations(documentId),
      ])
      setDocument(doc)
      setTranslations(translationList)
      if (translationList[0]) {
        setTargetLanguage(translationList[0].targetLanguage)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    void load()
  }, [load])

  // Fetch the PDF bytes through the authenticated client and expose them as a blob URL.
  useEffect(() => {
    if (!document || !isPdfDocument(document)) {
      setFileUrl(null)
      return
    }
    let revoked = false
    let objectUrl = ''
    setPdfError('')
    documentApi
      .getDocumentFile(document.id)
      .then((buffer) => {
        if (revoked) return
        objectUrl = URL.createObjectURL(
          new Blob([buffer], { type: 'application/pdf' }),
        )
        setFileUrl(objectUrl)
      })
      .catch((err) => {
        if (!revoked) setPdfError(getErrorMessage(err))
      })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [document])

  const activeTranslation = useMemo(
    () =>
      translations.find(
        (translation) =>
          translation.targetLanguage.toLowerCase() ===
          targetLanguage.trim().toLowerCase(),
      ) ?? null,
    [translations, targetLanguage],
  )

  const latestTranslation = translations[0] ?? null

  const isPdf = document ? isPdfDocument(document) : false

  const originalPages = useMemo<string[]>(() => {
    if (!document) return []
    if (document.pageTexts && document.pageTexts.length > 0) {
      return document.pageTexts
    }
    return document.extractedText ? [document.extractedText] : []
  }, [document])

  // Number of side-by-side rows: PDF page count when rendering a PDF, otherwise text pages.
  const pageCount = isPdf
    ? numPages || document?.pageCount || 0
    : originalPages.length

  const rightPages = useMemo<(string | null)[]>(() => {
    if (!activeTranslation) return []
    return rightMode === 'translation'
      ? activeTranslation.translatedPages ?? [activeTranslation.translatedText]
      : activeTranslation.simplifiedPages ?? [activeTranslation.simplifiedText]
  }, [activeTranslation, rightMode])

  const twoColumn = columnsWidth >= TWO_COLUMN_BREAKPOINT
  const pageWidth = twoColumn
    ? Math.floor((columnsWidth - COLUMN_GAP) / 2)
    : Math.floor(columnsWidth)

  async function handleProcess(e: FormEvent) {
    e.preventDefault()
    if (!document) return
    setProcessing(true)
    setError('')
    try {
      const created = await documentApi.createTranslation(
        document.id,
        targetLanguage.trim(),
      )
      setTranslations((prev) => [
        created,
        ...prev.filter((translation) => translation.id !== created.id),
      ])
      setRightMode('translation')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  async function handleDownload() {
    if (!document) return
    setError('')
    try {
      await documentApi.downloadDocument(document)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function rightTextForPage(index: number): string {
    if (!activeTranslation) {
      return rightMode === 'translation'
        ? t('documentDetail.noTranslation')
        : t('documentDetail.noExplanation')
    }
    const value = rightPages[index]
    if (value && value.trim().length > 0) return value
    return '—'
  }

  const modeButtonClass = (key: RightMode) =>
    [
      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      rightMode === key
        ? 'bg-primary text-primary-foreground'
        : 'bg-accent text-muted-foreground ring-1 ring-white/10 hover:bg-white/5 hover:text-foreground',
    ].join(' ')

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('documentDetail.back')}
      </Link>

      <ErrorAlert message={error} />

      {loading || !document ? (
        <Spinner label={t('documentDetail.loading')} />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {document.courseCode}
              </span>
              <h1 className="mt-3 text-2xl font-semibold text-foreground">
                {document.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {document.originalFilename} · {document.originalLanguage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-muted px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              {t('common.download')}
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <aside className="space-y-4 rounded-xl border border-white/8 bg-muted p-5 shadow-sm">
              <div>
                <h2 className="font-semibold text-foreground">
                  {t('documentDetail.processingTitle')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('documentDetail.processingDescription')}
                </p>
              </div>
              <form onSubmit={(e) => void handleProcess(e)} className="space-y-3">
                <div>
                  <label
                    htmlFor="target-language"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                  >
                    {t('documentDetail.targetLanguage')}
                  </label>
                  <select
                    id="target-language"
                    required
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-accent px-3 py-2.5 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {languageOptions.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={processing || !document.extractedText}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Languages className="h-4 w-4" />
                  {processing ? t('documentDetail.processing') : t('common.generate')}
                </button>
              </form>
              {latestTranslation ? (
                <div className="rounded-lg bg-accent p-3 text-xs text-muted-foreground">
                  {t('documentDetail.latestResult', {
                    language: latestTranslation.targetLanguage,
                  })}
                </div>
              ) : null}
            </aside>

            <section className="min-w-0 rounded-xl border border-white/8 bg-muted shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('documentDetail.original')}
                  <span className="mx-2 text-white/20">|</span>
                  {t('documentDetail.sideBySide')}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRightMode('translation')}
                    className={modeButtonClass('translation')}
                  >
                    {t('documentDetail.translation')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightMode('simplified')}
                    className={modeButtonClass('simplified')}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      {t('documentDetail.explanation')}
                    </span>
                  </button>
                </div>
              </div>

              <div className="max-h-[78vh] overflow-auto p-5">
                <div ref={columnsRef} className="min-w-0">
                  {isPdf && pdfError ? (
                    <ErrorAlert message={pdfError} />
                  ) : null}

                  {isPdf && !fileUrl && !pdfError ? (
                    <Spinner label={t('documentDetail.rendering')} />
                  ) : null}

                  {isPdf && fileUrl ? (
                    <PdfDocument
                      file={fileUrl}
                      onLoadSuccess={({ numPages: loaded }) =>
                        setNumPages(loaded)
                      }
                      onLoadError={(err) => setPdfError(err.message)}
                      loading={<Spinner label={t('documentDetail.rendering')} />}
                    >
                      <div className="space-y-6">
                        {Array.from({ length: pageCount }, (_, index) => (
                          <PageRow
                            key={index}
                            twoColumn={twoColumn}
                            gap={COLUMN_GAP}
                          >
                            <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/10">
                              <PdfPage
                                pageNumber={index + 1}
                                width={pageWidth > 0 ? pageWidth : undefined}
                              />
                            </div>
                            <RightCell text={rightTextForPage(index)} page={index + 1} />
                          </PageRow>
                        ))}
                      </div>
                    </PdfDocument>
                  ) : null}

                  {!isPdf ? (
                    originalPages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('documentDetail.noReadable')}
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {originalPages.map((pageText, index) => (
                          <PageRow
                            key={index}
                            twoColumn={twoColumn}
                            gap={COLUMN_GAP}
                          >
                            <div className="min-w-0 rounded-lg bg-accent p-4 ring-1 ring-white/10">
                              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
                                {pageText || '—'}
                              </pre>
                            </div>
                            <RightCell
                              text={rightTextForPage(index)}
                              page={index + 1}
                            />
                          </PageRow>
                        ))}
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function PageRow({
  twoColumn,
  gap,
  children,
}: {
  twoColumn: boolean
  gap: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: twoColumn ? '1fr 1fr' : '1fr',
        gap,
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  )
}

function RightCell({ text, page }: { text: string; page: number }) {
  const { t } = useLanguage()
  return (
    <div className="min-w-0 rounded-lg bg-accent p-4 ring-1 ring-white/10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('documentDetail.page', { page })}
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-foreground">
        {text}
      </pre>
    </div>
  )
}
