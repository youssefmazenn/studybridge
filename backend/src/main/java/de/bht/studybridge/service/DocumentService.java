package de.bht.studybridge.service;

import de.bht.studybridge.dto.DocumentResponse;
import de.bht.studybridge.exception.BadRequestException;
import de.bht.studybridge.exception.ResourceNotFoundException;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.model.Document;
import de.bht.studybridge.model.DocumentContent;
import de.bht.studybridge.repository.DocumentContentRepository;
import de.bht.studybridge.repository.DocumentRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentContentRepository documentContentRepository;
    private final CourseService courseService;

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentContentRepository documentContentRepository,
            CourseService courseService) {
        this.documentRepository = documentRepository;
        this.documentContentRepository = documentContentRepository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listForCurrentUser(Long courseId, String search) {
        Long userId = courseService.getCurrentUserId();
        List<Document> documents;
        if (courseId != null) {
            documents = documentRepository.findAllByCourse_User_IdAndCourse_IdOrderByUploadDateDesc(
                    userId, courseId);
        } else if (search != null && !search.trim().isEmpty()) {
            documents = documentRepository.findAllByCourse_User_IdAndTitleContainingIgnoreCaseOrderByUploadDateDesc(
                    userId, search.trim());
        } else {
            documents = documentRepository.findAllByCourse_User_IdOrderByUploadDateDesc(userId);
        }
        return documents.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DocumentResponse getByIdForCurrentUser(Long documentId) {
        return toResponse(findOwnedDocumentEntity(documentId));
    }

    @Transactional
    public DocumentResponse create(
            Long courseId,
            String title,
            String originalLanguage,
            MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Document file is required");
        }
        Course course = courseService.findOwnedCourseEntity(courseId);
        String normalizedTitle = normalizeRequired(title, "Title is required");
        String normalizedLanguage = normalizeRequired(originalLanguage, "Original language is required");
        String originalFilename = file.getOriginalFilename() == null
                ? "document"
                : Paths.get(file.getOriginalFilename()).getFileName().toString();
        String contentType = file.getContentType() == null
                ? "application/octet-stream"
                : file.getContentType();

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Could not read uploaded document");
        }

        Document document = new Document();
        document.setCourse(course);
        document.setTitle(normalizedTitle);
        document.setOriginalFilename(originalFilename);
        document.setContentType(contentType);
        document.setFileSize(file.getSize());
        document.setOriginalLanguage(normalizedLanguage);
        List<String> pages = extractPages(data, contentType, originalFilename);
        document.setPageTexts(pages);
        document.setExtractedText(String.join("\n\n", pages).trim());
        document.setUploadDate(LocalDateTime.now());
        Document saved = documentRepository.save(document);
        documentContentRepository.save(new DocumentContent(saved.getId(), data));
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long documentId) {
        Document document = findOwnedDocumentEntity(documentId);
        documentContentRepository.deleteById(document.getId());
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public DocumentDownload getDownload(Long documentId) {
        Document document = findOwnedDocumentEntity(documentId);
        DocumentContent content = documentContentRepository
                .findById(document.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document file not found"));
        Resource resource = new ByteArrayResource(content.getData());
        return new DocumentDownload(resource, document.getOriginalFilename(), document.getContentType());
    }

    @Transactional(readOnly = true)
    public long countForCurrentUser() {
        return documentRepository.countByCourse_User_Id(courseService.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public Document findOwnedDocumentEntity(Long documentId) {
        return documentRepository
                .findByIdAndCourse_User_Id(documentId, courseService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    /**
     * Extracts text preserving the document's page structure: index {@code i} holds the text of
     * page {@code i + 1}. This per-page alignment lets the UI place each translated page next to the
     * matching rendered page instead of collapsing everything into one flat block. Non-PDF files are
     * returned as a single page.
     */
    private List<String> extractPages(byte[] data, String contentType, String filename) {
        String lowerName = filename.toLowerCase(Locale.ROOT);
        try {
            if ("application/pdf".equalsIgnoreCase(contentType) || lowerName.endsWith(".pdf")) {
                try (PDDocument pdf = Loader.loadPDF(data)) {
                    List<String> pages = new ArrayList<>();
                    PDFTextStripper stripper = new PDFTextStripper();
                    int pageCount = pdf.getNumberOfPages();
                    for (int page = 1; page <= pageCount; page++) {
                        stripper.setStartPage(page);
                        stripper.setEndPage(page);
                        pages.add(stripper.getText(pdf).trim());
                    }
                    return pages;
                }
            }
            if (contentType.toLowerCase(Locale.ROOT).startsWith("text/") || isTextLikeFile(lowerName)) {
                return List.of(new String(data, StandardCharsets.UTF_8).trim());
            }
        } catch (IOException e) {
            return List.of();
        }
        return List.of();
    }

    private static String normalizeRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private static boolean isTextLikeFile(String lowerName) {
        return lowerName.endsWith(".txt")
                || lowerName.endsWith(".md")
                || lowerName.endsWith(".csv")
                || lowerName.endsWith(".json")
                || lowerName.endsWith(".xml")
                || lowerName.endsWith(".html")
                || lowerName.endsWith(".css")
                || lowerName.endsWith(".java")
                || lowerName.endsWith(".properties")
                || lowerName.endsWith(".sql")
                || lowerName.endsWith(".ts")
                || lowerName.endsWith(".tsx")
                || lowerName.endsWith(".yaml")
                || lowerName.endsWith(".yml");
    }

    private DocumentResponse toResponse(Document document) {
        Course course = document.getCourse();
        return new DocumentResponse(
                document.getId(),
                course.getId(),
                course.getCourseCode(),
                course.getTitle(),
                document.getTitle(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getOriginalLanguage(),
                document.getExtractedText(),
                document.getPageTexts(),
                document.getUploadDate());
    }

    public record DocumentDownload(Resource resource, String filename, String contentType) {
    }
}
