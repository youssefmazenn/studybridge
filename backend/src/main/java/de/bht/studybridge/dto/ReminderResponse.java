package de.bht.studybridge.dto;

import de.bht.studybridge.model.ReminderType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReminderResponse {

    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private String courseCode;
    private LocalDate assignmentDueDate;
    private LocalDateTime remindAt;
    private ReminderType reminderType;
    private boolean sent;

    public ReminderResponse() {
    }

    public ReminderResponse(
            Long id,
            Long assignmentId,
            String assignmentTitle,
            String courseCode,
            LocalDate assignmentDueDate,
            LocalDateTime remindAt,
            ReminderType reminderType,
            boolean sent) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.assignmentTitle = assignmentTitle;
        this.courseCode = courseCode;
        this.assignmentDueDate = assignmentDueDate;
        this.remindAt = remindAt;
        this.reminderType = reminderType;
        this.sent = sent;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getAssignmentTitle() {
        return assignmentTitle;
    }

    public void setAssignmentTitle(String assignmentTitle) {
        this.assignmentTitle = assignmentTitle;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public LocalDate getAssignmentDueDate() {
        return assignmentDueDate;
    }

    public void setAssignmentDueDate(LocalDate assignmentDueDate) {
        this.assignmentDueDate = assignmentDueDate;
    }

    public LocalDateTime getRemindAt() {
        return remindAt;
    }

    public void setRemindAt(LocalDateTime remindAt) {
        this.remindAt = remindAt;
    }

    public ReminderType getReminderType() {
        return reminderType;
    }

    public void setReminderType(ReminderType reminderType) {
        this.reminderType = reminderType;
    }

    public boolean isSent() {
        return sent;
    }

    public void setSent(boolean sent) {
        this.sent = sent;
    }
}
