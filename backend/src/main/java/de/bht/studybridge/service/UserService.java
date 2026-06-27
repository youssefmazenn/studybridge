package de.bht.studybridge.service;

import de.bht.studybridge.dto.RegisterRequest;
import de.bht.studybridge.dto.UserResponse;
import de.bht.studybridge.exception.BadRequestException;
import de.bht.studybridge.exception.DuplicateEmailException;
import de.bht.studybridge.exception.ResourceNotFoundException;
import de.bht.studybridge.model.Document;
import de.bht.studybridge.model.Role;
import de.bht.studybridge.model.User;
import de.bht.studybridge.repository.CourseRepository;
import de.bht.studybridge.repository.DocumentContentRepository;
import de.bht.studybridge.repository.DocumentRepository;
import de.bht.studybridge.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final DocumentContentRepository documentContentRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.emails:}")
    private String adminEmails;

    public UserService(
            UserRepository userRepository,
            CourseRepository courseRepository,
            DocumentRepository documentRepository,
            DocumentContentRepository documentContentRepository,
            EmailVerificationService emailVerificationService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.documentContentRepository = documentContentRepository;
        this.emailVerificationService = emailVerificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("An account with this email already exists");
        }
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPreferredLanguage(request.getPreferredLanguage().trim());
        user.setRole(isConfiguredAdminEmail(normalizedEmail) ? Role.ADMIN : Role.USER);
        user.setEnabled(true);
        emailVerificationService.prepareNewUser(user);
        user.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        emailVerificationService.sendVerificationEmail(saved);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("User not found");
        }
        String email = authentication.getName();
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        return toResponse(getCurrentUser());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsersForAdmin() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserEnabledForAdmin(Long userId, boolean enabled) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(userId) && !enabled) {
            throw new BadRequestException("Admins cannot deactivate their own account");
        }
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        return toResponse(user);
    }

    @Transactional
    public void deleteUserForAdmin(Long userId) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(userId)) {
            throw new BadRequestException("Admins cannot delete their own account");
        }
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Long> documentIds = documentRepository.findAllByCourse_User_IdOrderByUploadDateDesc(userId).stream()
                .map(Document::getId)
                .toList();
        documentContentRepository.deleteAllByIdInBatch(documentIds);
        courseRepository.deleteAll(courseRepository.findAllByUserIdOrderByCreatedAtDesc(userId));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean passwordMatches(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    public void promoteIfConfiguredAdmin(User user) {
        if (user.getRole() != Role.ADMIN && isConfiguredAdminEmail(user.getEmail())) {
            user.setRole(Role.ADMIN);
        }
    }

    private boolean isConfiguredAdminEmail(String email) {
        return List.of(adminEmails.split(",")).stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .anyMatch(email::equals);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPreferredLanguage(),
                user.getRole(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt());
    }
}
