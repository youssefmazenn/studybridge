package de.bht.studybridge.service;

import de.bht.studybridge.dto.CourseRequest;
import de.bht.studybridge.dto.CourseResponse;
import de.bht.studybridge.exception.ResourceNotFoundException;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.model.User;
import de.bht.studybridge.repository.CourseRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserService userService;

    public CourseService(CourseRepository courseRepository, UserService userService) {
        this.courseRepository = courseRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> listForCurrentUser() {
        User user = userService.getCurrentUser();
        return courseRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getByIdForCurrentUser(Long courseId) {
        Course course = findOwnedCourse(courseId);
        return toResponse(course);
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        User user = userService.getCurrentUser();
        Course course = new Course();
        applyRequest(course, request);
        course.setUser(user);
        course.setCreatedAt(LocalDateTime.now());
        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Transactional
    public CourseResponse update(Long courseId, CourseRequest request) {
        Course course = findOwnedCourse(courseId);
        applyRequest(course, request);
        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long courseId) {
        Course course = findOwnedCourse(courseId);
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public long countForCurrentUser() {
        return courseRepository.countByUserId(getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public Long getCurrentUserId() {
        return userService.getCurrentUser().getId();
    }

    @Transactional(readOnly = true)
    public Course findOwnedCourseEntity(Long courseId) {
        return courseRepository
                .findByIdAndUserId(courseId, getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private Course findOwnedCourse(Long courseId) {
        return findOwnedCourseEntity(courseId);
    }

    private void applyRequest(Course course, CourseRequest request) {
        course.setTitle(request.getTitle().trim());
        course.setCourseCode(request.getCourseCode().trim());
        course.setSemester(request.getSemester().trim());
        course.setInstructor(normalizeOptionalText(request.getInstructor()));
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCourseCode(),
                course.getSemester(),
                course.getInstructor(),
                course.getCreatedAt());
    }
}
