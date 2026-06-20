package de.bht.studybridge.controller;

import de.bht.studybridge.dto.ReminderRequest;
import de.bht.studybridge.dto.ReminderResponse;
import de.bht.studybridge.service.ReminderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping("/reminders")
    public List<ReminderResponse> list(
            @RequestParam(required = false, defaultValue = "false") boolean dueOnly) {
        if (dueOnly) {
            return reminderService.listDueForCurrentUser();
        }
        return reminderService.listForCurrentUser();
    }

    @GetMapping("/reminders/{id}")
    public ReminderResponse getById(@PathVariable Long id) {
        return reminderService.getByIdForCurrentUser(id);
    }

    @GetMapping("/assignments/{assignmentId}/reminders")
    public List<ReminderResponse> listForAssignment(@PathVariable Long assignmentId) {
        return reminderService.listForAssignment(assignmentId);
    }

    @PostMapping("/assignments/{assignmentId}/reminders")
    public ResponseEntity<ReminderResponse> create(
            @PathVariable Long assignmentId, @Valid @RequestBody ReminderRequest request) {
        ReminderResponse created = reminderService.create(assignmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/reminders/{id}")
    public ReminderResponse update(@PathVariable Long id, @Valid @RequestBody ReminderRequest request) {
        return reminderService.update(id, request);
    }

    @PatchMapping("/reminders/{id}/sent")
    public ReminderResponse markSent(@PathVariable Long id, @RequestParam boolean sent) {
        return reminderService.markSent(id, sent);
    }

    @DeleteMapping("/reminders/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reminderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
