package de.bht.studybridge.dto;

import de.bht.studybridge.model.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public class AssignmentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AssignmentStatus status;

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }
}
