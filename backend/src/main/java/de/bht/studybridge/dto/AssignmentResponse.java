package de.bht.studybridge.dto;

import de.bht.studybridge.model.AssignmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssignmentResponse {

    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private String title;
    private String description;
    private LocalDate dueDate;
    private AssignmentStatus status;
    private LocalDateTime createdAt;

    public AssignmentResponse() {
    }

    public AssignmentResponse(
            Long id,
            Long courseId,
            String courseCode,
            String courseTitle,
            String title,
            String description,
            LocalDate dueDate,
            AssignmentStatus status,
            LocalDateTime createdAt) {
        this.id = id;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
