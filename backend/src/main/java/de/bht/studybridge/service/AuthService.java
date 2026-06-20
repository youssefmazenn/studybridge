package de.bht.studybridge.service;

import de.bht.studybridge.dto.LoginResponse;
import de.bht.studybridge.dto.UserResponse;
import de.bht.studybridge.exception.InvalidCredentialsException;
import de.bht.studybridge.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse loginWithBasicCredentials(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userService
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        if (!userService.passwordMatches(user, password)) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);
        UserResponse userResponse =
                new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPreferredLanguage());
        LoginResponse response = new LoginResponse();
        response.setAccessToken(token);
        response.setTokenType("Bearer");
        response.setUser(userResponse);
        return response;
    }
}
