package de.bht.studybridge.service;

import de.bht.studybridge.dto.AssignmentRequest;
import de.bht.studybridge.dto.AssignmentResponse;
import de.bht.studybridge.exception.ResourceNotFoundException;
import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.AssignmentStatus;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.repository.AssignmentRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseService courseService;

    public AssignmentService(AssignmentRepository assignmentRepository, CourseService courseService) {
        this.assignmentRepository = assignmentRepository;
        this.courseService = courseService;
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listForCurrentUser(AssignmentStatus statusFilter) {
        Long userId = courseService.getCurrentUserId();
        List<Assignment> assignments = statusFilter == null
                ? assignmentRepository.findAllByCourse_User_IdOrderByDueDateAsc(userId)
                : assignmentRepository.findAllByCourse_User_IdAndStatusOrderByDueDateAsc(
                        userId, statusFilter);
        return assignments.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getByIdForCurrentUser(Long assignmentId) {
        return toResponse(findOwnedAssignment(assignmentId));
    }

    @Transactional
    public AssignmentResponse create(AssignmentRequest request) {
        Course course = courseService.findOwnedCourseEntity(request.getCourseId());
        Assignment assignment = new Assignment();
        applyRequest(assignment, request, course);
        assignment.setCreatedAt(LocalDateTime.now());
        if (assignment.getStatus() == null) {
            assignment.setStatus(AssignmentStatus.PENDING);
        }
        return toResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentResponse update(Long assignmentId, AssignmentRequest request) {
        Assignment assignment = findOwnedAssignment(assignmentId);
        Course course = courseService.findOwnedCourseEntity(request.getCourseId());
        applyRequest(assignment, request, course);
        return toResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentResponse updateStatus(Long assignmentId, AssignmentStatus status) {
        Assignment assignment = findOwnedAssignment(assignmentId);
        assignment.setStatus(status);
        return toResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void delete(Long assignmentId) {
        Assignment assignment = findOwnedAssignment(assignmentId);
        assignmentRepository.delete(assignment);
    }

    @Transactional(readOnly = true)
    public long countPendingForCurrentUser() {
        return assignmentRepository.countByCourse_User_IdAndStatus(
                courseService.getCurrentUserId(), AssignmentStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public long countCompletedForCurrentUser() {
        return assignmentRepository.countByCourse_User_IdAndStatus(
                courseService.getCurrentUserId(), AssignmentStatus.COMPLETED);
    }

    @Transactional(readOnly = true)
    public Assignment findOwnedAssignmentEntity(Long assignmentId) {
        return assignmentRepository
                .findByIdAndCourse_User_Id(assignmentId, courseService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    private Assignment findOwnedAssignment(Long assignmentId) {
        return findOwnedAssignmentEntity(assignmentId);
    }

    private void applyRequest(Assignment assignment, AssignmentRequest request, Course course) {
        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(normalizeOptionalText(request.getDescription()));
        assignment.setDueDate(request.getDueDate());
        assignment.setCourse(course);
        if (request.getStatus() != null) {
            assignment.setStatus(request.getStatus());
        } else if (assignment.getStatus() == null) {
            assignment.setStatus(AssignmentStatus.PENDING);
        }
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AssignmentResponse toResponse(Assignment assignment) {
        Course course = assignment.getCourse();
        return new AssignmentResponse(
                assignment.getId(),
                course.getId(),
                course.getCourseCode(),
                course.getTitle(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDueDate(),
                assignment.getStatus(),
                assignment.getCreatedAt());
    }
}
