package de.bht.studybridge.repository;

import de.bht.studybridge.model.Document;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findAllByCourse_User_IdOrderByUploadDateDesc(Long userId);

    List<Document> findAllByCourse_User_IdAndCourse_IdOrderByUploadDateDesc(Long userId, Long courseId);

    List<Document> findAllByCourse_User_IdAndTitleContainingIgnoreCaseOrderByUploadDateDesc(
            Long userId, String title);

    Optional<Document> findByIdAndCourse_User_Id(Long id, Long userId);

    long countByCourse_User_Id(Long userId);
}
