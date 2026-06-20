package de.bht.studybridge.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TranslationResponse {

    private Long id;
    private Long documentId;
    private String targetLanguage;
    private String translatedText;
    private List<String> translatedPages;
    private String simplifiedText;
    private List<String> simplifiedPages;
    private LocalDateTime createdAt;

    public TranslationResponse() {
    }

    public TranslationResponse(
            Long id,
            Long documentId,
            String targetLanguage,
            String translatedText,
            List<String> translatedPages,
            String simplifiedText,
            List<String> simplifiedPages,
            LocalDateTime createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.targetLanguage = targetLanguage;
        this.translatedText = translatedText;
        this.translatedPages = translatedPages;
        this.simplifiedText = simplifiedText;
        this.simplifiedPages = simplifiedPages;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getTargetLanguage() {
        return targetLanguage;
    }

    public void setTargetLanguage(String targetLanguage) {
        this.targetLanguage = targetLanguage;
    }

    public String getTranslatedText() {
        return translatedText;
    }

    public void setTranslatedText(String translatedText) {
        this.translatedText = translatedText;
    }

    public List<String> getTranslatedPages() {
        return translatedPages;
    }

    public void setTranslatedPages(List<String> translatedPages) {
        this.translatedPages = translatedPages;
    }

    public String getSimplifiedText() {
        return simplifiedText;
    }

    public void setSimplifiedText(String simplifiedText) {
        this.simplifiedText = simplifiedText;
    }

    public List<String> getSimplifiedPages() {
        return simplifiedPages;
    }

    public void setSimplifiedPages(List<String> simplifiedPages) {
        this.simplifiedPages = simplifiedPages;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
