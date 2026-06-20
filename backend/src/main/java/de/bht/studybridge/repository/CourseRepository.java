package de.bht.studybridge.repository;

import de.bht.studybridge.model.Course;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Course> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
