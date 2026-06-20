package de.bht.studybridge.controller;

import de.bht.studybridge.dto.LoginResponse;
import de.bht.studybridge.dto.RegisterRequest;
import de.bht.studybridge.dto.UserResponse;
import de.bht.studybridge.exception.InvalidCredentialsException;
import de.bht.studybridge.service.AuthService;
import de.bht.studybridge.service.UserService;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse created = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/login")
    public LoginResponse login(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        BasicCredentials credentials = parseBasicAuth(authorizationHeader);
        return authService.loginWithBasicCredentials(credentials.email(), credentials.password());
    }

    private static BasicCredentials parseBasicAuth(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Basic ")) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(authorizationHeader.substring(6).trim());
        } catch (IllegalArgumentException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String userPass = new String(decoded, StandardCharsets.UTF_8);
        int colon = userPass.indexOf(':');
        if (colon < 0) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String email = userPass.substring(0, colon);
        String password = userPass.substring(colon + 1);
        return new BasicCredentials(email, password);
    }

    private record BasicCredentials(String email, String password) {
    }
}
