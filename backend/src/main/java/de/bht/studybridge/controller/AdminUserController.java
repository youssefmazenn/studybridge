package de.bht.studybridge.controller;

import de.bht.studybridge.dto.AdminUserEnabledRequest;
import de.bht.studybridge.dto.UserResponse;
import de.bht.studybridge.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userService.listUsersForAdmin();
    }

    @PatchMapping("/{id}/enabled")
    public UserResponse updateUserEnabled(
            @PathVariable Long id, @Valid @RequestBody AdminUserEnabledRequest request) {
        return userService.updateUserEnabledForAdmin(id, request.getEnabled());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUserForAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
