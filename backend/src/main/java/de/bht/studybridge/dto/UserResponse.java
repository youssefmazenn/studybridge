package de.bht.studybridge.dto;

import de.bht.studybridge.model.Role;
import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String preferredLanguage;
    private Role role;
    private boolean enabled;
    private boolean emailVerified;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, String preferredLanguage) {
        this(id, name, email, preferredLanguage, Role.USER, true, true, null);
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            String preferredLanguage,
            Role role,
            boolean enabled,
            boolean emailVerified,
            LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
        this.role = role;
        this.enabled = enabled;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
