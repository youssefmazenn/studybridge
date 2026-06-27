package de.bht.studybridge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.exception.BadRequestException;
import de.bht.studybridge.exception.EmailDeliveryException;
import de.bht.studybridge.model.User;
import de.bht.studybridge.repository.UserRepository;
import java.io.IOException;
import java.net.URLEncoder;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailVerificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailVerificationService.class);

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final SecureRandom secureRandom = new SecureRandom();
    private final boolean enabled;
    private final String fromAddress;
    private final String frontendBaseUrl;
    private final long tokenExpirationHours;
    private final String provider;
    private final String resendApiKey;
    private final String resendBaseUrl;

    public EmailVerificationService(
            JavaMailSender mailSender,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            @Value("${app.email-verification.enabled:false}") boolean enabled,
            @Value("${app.email-verification.from:no-reply@studybridge.local}") String fromAddress,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.email-verification.token-expiration-hours:24}") long tokenExpirationHours,
            @Value("${app.email-verification.provider:smtp}") String provider,
            @Value("${app.email-verification.resend.api-key:}") String resendApiKey,
            @Value("${app.email-verification.resend.base-url:https://api.resend.com/emails}")
                    String resendBaseUrl) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.enabled = enabled;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
        this.tokenExpirationHours = tokenExpirationHours;
        this.provider = provider.trim().toLowerCase();
        this.resendApiKey = resendApiKey;
        this.resendBaseUrl = resendBaseUrl;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void prepareNewUser(User user) {
        if (!enabled) {
            user.setEmailVerified(true);
            user.setEmailVerificationTokenHash(null);
            user.setEmailVerificationExpiresAt(null);
            return;
        }
        user.setEmailVerified(false);
        issueToken(user);
    }

    public void sendVerificationEmail(User user) {
        if (!enabled || user.isEmailVerified()) {
            return;
        }
        String token = issueToken(user);
        sendEmail(user, token);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository
                .findByEmailVerificationTokenHash(hashToken(token))
                .orElseThrow(() -> new BadRequestException("Invalid verification link"));
        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification link has expired. Request a new one.");
        }
        user.setEmailVerified(true);
        user.setEmailVerificationTokenHash(null);
        user.setEmailVerificationExpiresAt(null);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        if (!enabled) {
            return;
        }
        userRepository.findByEmail(email.trim().toLowerCase())
                .filter(user -> !user.isEmailVerified())
                .ifPresent(this::sendVerificationEmail);
    }

    private String issueToken(User user) {
        String token = generateToken();
        user.setEmailVerificationTokenHash(hashToken(token));
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(tokenExpirationHours));
        return token;
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Invalid verification link");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private void sendEmail(User user, String token) {
        String verifyUrl = verificationUrl(token);
        String subject = "Verify your StudyBridge email";
        String text = """
                Hi %s,

                Welcome to StudyBridge. Please verify your email address before signing in:

                %s

                This link expires in %d hours. If you did not create this account, you can ignore this email.
                """.formatted(user.getName(), verifyUrl, tokenExpirationHours).trim();

        if ("resend".equals(provider)) {
            sendWithResend(user, subject, text);
            return;
        }

        sendWithSmtp(user, subject, text);
    }

    private void sendWithSmtp(User user, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (MailException e) {
            LOGGER.warn(
                    "Failed to send verification email to {} from {} using frontend URL {}: {}",
                    user.getEmail(),
                    fromAddress,
                    frontendBaseUrl,
                    e.getMessage(),
                    e);
            throw new EmailDeliveryException("Could not send verification email", e);
        }
    }

    private void sendWithResend(User user, String subject, String text) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new EmailDeliveryException("Resend API key is not configured");
        }

        Map<String, Object> payload = Map.of(
                "from", fromAddress,
                "to", List.of(user.getEmail()),
                "subject", subject,
                "text", text);

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(resendBaseUrl))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return;
            }
            LOGGER.warn(
                    "Resend failed to send verification email to {} from {}. HTTP {}: {}",
                    user.getEmail(),
                    fromAddress,
                    response.statusCode(),
                    response.body());
            throw new EmailDeliveryException(
                    "Could not send verification email. Email provider returned HTTP "
                            + response.statusCode());
        } catch (JsonProcessingException e) {
            throw new EmailDeliveryException("Could not prepare verification email", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new EmailDeliveryException("Verification email delivery was interrupted", e);
        } catch (IOException | IllegalArgumentException e) {
            LOGGER.warn(
                    "Resend failed to send verification email to {} from {} using {}: {}",
                    user.getEmail(),
                    fromAddress,
                    resendBaseUrl,
                    e.getMessage(),
                    e);
            throw new EmailDeliveryException("Could not send verification email", e);
        }
    }

    private String verificationUrl(String token) {
        String baseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;
        return baseUrl + "/verify-email?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
    }
}
