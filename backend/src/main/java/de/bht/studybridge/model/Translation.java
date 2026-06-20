package de.bht.studybridge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "translations")
public class Translation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "target_language")
    private String targetLanguage;

    @Column(nullable = false, columnDefinition = "TEXT", name = "translated_text")
    private String translatedText;

    @Convert(converter = StringListJsonConverter.class)
    @Column(columnDefinition = "TEXT", name = "translated_pages")
    private List<String> translatedPages;

    @Column(nullable = false, columnDefinition = "TEXT", name = "simplified_text")
    private String simplifiedText;

    @Convert(converter = StringListJsonConverter.class)
    @Column(columnDefinition = "TEXT", name = "simplified_pages")
    private List<String> simplifiedPages;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Document document;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
