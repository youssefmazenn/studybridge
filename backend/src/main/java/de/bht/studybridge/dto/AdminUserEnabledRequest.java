package de.bht.studybridge.dto;

import jakarta.validation.constraints.NotNull;

public class AdminUserEnabledRequest {

    @NotNull
    private Boolean enabled;

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}
