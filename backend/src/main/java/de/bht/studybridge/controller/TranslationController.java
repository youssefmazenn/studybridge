package de.bht.studybridge.controller;

import de.bht.studybridge.dto.TranslationRequest;
import de.bht.studybridge.dto.TranslationResponse;
import de.bht.studybridge.service.TranslationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/documents/{documentId}/translations")
public class TranslationController {

    private final TranslationService translationService;

    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    @GetMapping
    public List<TranslationResponse> list(@PathVariable Long documentId) {
        return translationService.listForDocument(documentId);
    }

    @PostMapping
    public ResponseEntity<TranslationResponse> create(
            @PathVariable Long documentId, @Valid @RequestBody TranslationRequest request) {
        TranslationResponse created =
                translationService.createOrRefresh(documentId, request.getTargetLanguage());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
