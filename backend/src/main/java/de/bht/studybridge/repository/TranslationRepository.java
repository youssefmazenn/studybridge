package de.bht.studybridge.repository;

import de.bht.studybridge.model.Translation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TranslationRepository extends JpaRepository<Translation, Long> {

    List<Translation> findAllByDocument_IdAndDocument_Course_User_IdOrderByCreatedAtDesc(
            Long documentId, Long userId);

    Optional<Translation> findByDocument_IdAndDocument_Course_User_IdAndTargetLanguageIgnoreCase(
            Long documentId, Long userId, String targetLanguage);
}
