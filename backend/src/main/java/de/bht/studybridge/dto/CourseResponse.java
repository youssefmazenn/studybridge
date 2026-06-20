package de.bht.studybridge.dto;

import java.time.LocalDateTime;

public class CourseResponse {

    private Long id;
    private String title;
    private String courseCode;
    private String semester;
    private String instructor;
    private LocalDateTime createdAt;

    public CourseResponse() {
    }

    public CourseResponse(
            Long id,
            String title,
            String courseCode,
            String semester,
            String instructor,
            LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.courseCode = courseCode;
        this.semester = semester;
        this.instructor = instructor;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
