package de.bht.studybridge.repository;

import de.bht.studybridge.model.Reminder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findAllByAssignment_Course_User_IdOrderByRemindAtAsc(Long userId);

    List<Reminder> findAllByAssignment_IdAndAssignment_Course_User_IdOrderByRemindAtAsc(
            Long assignmentId, Long userId);

    List<Reminder> findAllByAssignment_Course_User_IdAndSentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
            Long userId, LocalDateTime until);

    @EntityGraph(attributePaths = {"assignment", "assignment.course", "assignment.course.user"})
    List<Reminder> findTop50BySentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(LocalDateTime until);

    Optional<Reminder> findByIdAndAssignment_Course_User_Id(Long id, Long userId);
}
