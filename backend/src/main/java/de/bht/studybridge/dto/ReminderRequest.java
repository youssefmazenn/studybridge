package de.bht.studybridge.dto;

import de.bht.studybridge.model.ReminderType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ReminderRequest {

    @NotNull(message = "Remind at is required")
    private LocalDateTime remindAt;

    @NotNull(message = "Reminder type is required")
    private ReminderType reminderType;

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
}
