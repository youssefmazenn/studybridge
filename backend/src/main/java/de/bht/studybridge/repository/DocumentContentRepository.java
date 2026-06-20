package de.bht.studybridge.repository;

import de.bht.studybridge.model.DocumentContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentContentRepository extends JpaRepository<DocumentContent, Long> {
}
