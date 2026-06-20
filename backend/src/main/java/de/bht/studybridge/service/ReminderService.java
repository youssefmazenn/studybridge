package de.bht.studybridge.service;

import de.bht.studybridge.dto.ReminderRequest;
import de.bht.studybridge.dto.ReminderResponse;
import de.bht.studybridge.exception.ResourceNotFoundException;
import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.repository.ReminderRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final AssignmentService assignmentService;
    private final CourseService courseService;

    public ReminderService(
            ReminderRepository reminderRepository,
            AssignmentService assignmentService,
            CourseService courseService) {
        this.reminderRepository = reminderRepository;
        this.assignmentService = assignmentService;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> listForCurrentUser() {
        return reminderRepository
                .findAllByAssignment_Course_User_IdOrderByRemindAtAsc(courseService.getCurrentUserId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> listForAssignment(Long assignmentId) {
        Long userId = courseService.getCurrentUserId();
        assignmentService.findOwnedAssignmentEntity(assignmentId);
        return reminderRepository
                .findAllByAssignment_IdAndAssignment_Course_User_IdOrderByRemindAtAsc(assignmentId, userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> listDueForCurrentUser() {
        LocalDateTime now = LocalDateTime.now();
        return reminderRepository
                .findAllByAssignment_Course_User_IdAndSentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
                        courseService.getCurrentUserId(), now)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReminderResponse getByIdForCurrentUser(Long reminderId) {
        return toResponse(findOwnedReminder(reminderId));
    }

    @Transactional
    public ReminderResponse create(Long assignmentId, ReminderRequest request) {
        Assignment assignment = assignmentService.findOwnedAssignmentEntity(assignmentId);
        Reminder reminder = new Reminder();
        reminder.setAssignment(assignment);
        reminder.setRemindAt(request.getRemindAt());
        reminder.setReminderType(request.getReminderType());
        reminder.setSent(false);
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse update(Long reminderId, ReminderRequest request) {
        Reminder reminder = findOwnedReminder(reminderId);
        reminder.setRemindAt(request.getRemindAt());
        reminder.setReminderType(request.getReminderType());
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public ReminderResponse markSent(Long reminderId, boolean sent) {
        Reminder reminder = findOwnedReminder(reminderId);
        reminder.setSent(sent);
        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional
    public void delete(Long reminderId) {
        Reminder reminder = findOwnedReminder(reminderId);
        reminderRepository.delete(reminder);
    }

    private Reminder findOwnedReminder(Long reminderId) {
        return reminderRepository
                .findByIdAndAssignment_Course_User_Id(reminderId, courseService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));
    }

    private ReminderResponse toResponse(Reminder reminder) {
        Assignment assignment = reminder.getAssignment();
        return new ReminderResponse(
                reminder.getId(),
                assignment.getId(),
                assignment.getTitle(),
                assignment.getCourse().getCourseCode(),
                assignment.getDueDate(),
                reminder.getRemindAt(),
                reminder.getReminderType(),
                reminder.isSent());
    }
}
