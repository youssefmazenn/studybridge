package de.bht.studybridge.repository;

import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.AssignmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findAllByCourse_User_IdOrderByDueDateAsc(Long userId);

    List<Assignment> findAllByCourse_User_IdAndStatusOrderByDueDateAsc(
            Long userId, AssignmentStatus status);

    Optional<Assignment> findByIdAndCourse_User_Id(Long id, Long userId);

    long countByCourse_User_IdAndStatus(Long userId, AssignmentStatus status);
}
