package de.bht.studybridge.service;

import de.bht.studybridge.dto.TranslationResponse;
import de.bht.studybridge.exception.BadRequestException;
import de.bht.studybridge.model.Document;
import de.bht.studybridge.model.Translation;
import de.bht.studybridge.repository.TranslationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TranslationService {

    private final TranslationRepository translationRepository;
    private final DocumentService documentService;
    private final TranslationClient translationClient;

    public TranslationService(
            TranslationRepository translationRepository,
            DocumentService documentService,
            TranslationClient translationClient) {
        this.translationRepository = translationRepository;
        this.documentService = documentService;
        this.translationClient = translationClient;
    }

    @Transactional(readOnly = true)
    public List<TranslationResponse> listForDocument(Long documentId) {
        Document document = documentService.findOwnedDocumentEntity(documentId);
        return translationRepository
                .findAllByDocument_IdAndDocument_Course_User_IdOrderByCreatedAtDesc(
                        document.getId(), document.getCourse().getUser().getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TranslationResponse createOrRefresh(Long documentId, String targetLanguage) {
        Document document = documentService.findOwnedDocumentEntity(documentId);
        String normalizedLanguage = normalizeTargetLanguage(targetLanguage);
        List<String> sourcePages = resolveSourcePages(document);
        if (sourcePages.isEmpty()) {
            throw new BadRequestException("No readable text could be extracted from this document");
        }

        List<String> translatedPages = new ArrayList<>(sourcePages.size());
        List<String> simplifiedPages = new ArrayList<>(sourcePages.size());
        for (String pageText : sourcePages) {
            if (pageText == null || pageText.isBlank()) {
                // Keep an empty slot so page N of the translation still lines up with page N of the PDF.
                translatedPages.add("");
                simplifiedPages.add("");
                continue;
            }
            String translatedPage = translationClient.translate(
                    pageText, document.getOriginalLanguage(), normalizedLanguage);
            translatedPages.add(translatedPage);
            simplifiedPages.add(simplify(translatedPage, normalizedLanguage));
        }

        String translatedText = String.join("\n\n", translatedPages).trim();
        String simplifiedText = String.join("\n\n", simplifiedPages).trim();
        Translation translation = translationRepository
                .findByDocument_IdAndDocument_Course_User_IdAndTargetLanguageIgnoreCase(
                        document.getId(), document.getCourse().getUser().getId(), normalizedLanguage)
                .orElseGet(Translation::new);
        translation.setDocument(document);
        translation.setTargetLanguage(normalizedLanguage);
        translation.setTranslatedText(translatedText);
        translation.setTranslatedPages(translatedPages);
        translation.setSimplifiedText(simplifiedText);
        translation.setSimplifiedPages(simplifiedPages);
        translation.setCreatedAt(LocalDateTime.now());
        return toResponse(translationRepository.save(translation));
    }

    /**
     * Returns the document's per-page text. Falls back to the flat extracted text as a single page
     * for documents stored before per-page extraction existed.
     */
    private static List<String> resolveSourcePages(Document document) {
        List<String> pages = document.getPageTexts();
        if (pages != null && !pages.isEmpty()) {
            return pages;
        }
        String extractedText = document.getExtractedText();
        if (extractedText != null && !extractedText.isBlank()) {
            return List.of(extractedText);
        }
        return List.of();
    }

    private static String simplify(String translatedText, String targetLanguage) {
        String normalized = translatedText.replaceAll("\\s+", " ").trim();
        if (normalized.length() > 1200) {
            normalized = normalized.substring(0, 1200).trim() + "...";
        }
        return """
                Simplified explanation (%s):

                Main idea:
                %s

                Review the original text beside this translation and add course-specific notes where needed.
                """.formatted(targetLanguage, normalized).trim();
    }

    private static String normalizeTargetLanguage(String targetLanguage) {
        if (targetLanguage == null || targetLanguage.trim().isEmpty()) {
            throw new BadRequestException("Target language is required");
        }
        return targetLanguage.trim();
    }

    private TranslationResponse toResponse(Translation translation) {
        return new TranslationResponse(
                translation.getId(),
                translation.getDocument().getId(),
                translation.getTargetLanguage(),
                translation.getTranslatedText(),
                translation.getTranslatedPages(),
                translation.getSimplifiedText(),
                translation.getSimplifiedPages(),
                translation.getCreatedAt());
    }
}
