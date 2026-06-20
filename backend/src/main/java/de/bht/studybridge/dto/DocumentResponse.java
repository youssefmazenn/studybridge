package de.bht.studybridge.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DocumentResponse {

    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private String title;
    private String originalFilename;
    private String contentType;
    private long fileSize;
    private String originalLanguage;
    private String extractedText;
    private List<String> pageTexts;
    private int pageCount;
    private LocalDateTime uploadDate;

    public DocumentResponse() {
    }

    public DocumentResponse(
            Long id,
            Long courseId,
            String courseCode,
            String courseTitle,
            String title,
            String originalFilename,
            String contentType,
            long fileSize,
            String originalLanguage,
            String extractedText,
            List<String> pageTexts,
            LocalDateTime uploadDate) {
        this.id = id;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.title = title;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.originalLanguage = originalLanguage;
        this.extractedText = extractedText;
        this.pageTexts = pageTexts;
        this.pageCount = pageTexts == null ? 0 : pageTexts.size();
        this.uploadDate = uploadDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public List<String> getPageTexts() {
        return pageTexts;
    }

    public void setPageTexts(List<String> pageTexts) {
        this.pageTexts = pageTexts;
        this.pageCount = pageTexts == null ? 0 : pageTexts.size();
    }

    public int getPageCount() {
        return pageCount;
    }

    public void setPageCount(int pageCount) {
        this.pageCount = pageCount;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
}
