package de.bht.studybridge.controller;

import de.bht.studybridge.dto.AssignmentRequest;
import de.bht.studybridge.dto.AssignmentResponse;
import de.bht.studybridge.dto.AssignmentStatusUpdateRequest;
import de.bht.studybridge.model.AssignmentStatus;
import de.bht.studybridge.service.AssignmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public List<AssignmentResponse> list(@RequestParam(required = false) AssignmentStatus status) {
        return assignmentService.listForCurrentUser(status);
    }

    @GetMapping("/{id}")
    public AssignmentResponse getById(@PathVariable Long id) {
        return assignmentService.getByIdForCurrentUser(id);
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse created = assignmentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public AssignmentResponse update(@PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        return assignmentService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public AssignmentResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody AssignmentStatusUpdateRequest request) {
        return assignmentService.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
