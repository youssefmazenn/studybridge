package de.bht.studybridge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.exception.EmailDeliveryException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailDeliveryService.class);

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public EmailDeliveryService(JavaMailSender mailSender, ObjectMapper objectMapper) {
        this.mailSender = mailSender;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void send(OutboundEmail email) {
        if ("resend".equals(email.provider())) {
            sendWithResend(email);
            return;
        }
        sendWithSmtp(email);
    }

    private void sendWithSmtp(OutboundEmail email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(email.from());
        message.setTo(email.to());
        message.setSubject(email.subject());
        message.setText(email.text());
        try {
            mailSender.send(message);
        } catch (MailException e) {
            LOGGER.warn(
                    "Failed to send {} to {} from {}: {}",
                    email.purpose(),
                    email.to(),
                    email.from(),
                    e.getMessage(),
                    e);
            throw new EmailDeliveryException(email.failureMessage(), e);
        }
    }

    private void sendWithResend(OutboundEmail email) {
        if (email.resendApiKey() == null || email.resendApiKey().isBlank()) {
            throw new EmailDeliveryException("Resend API key is not configured");
        }

        Map<String, Object> payload = Map.of(
                "from", email.from(),
                "to", List.of(email.to()),
                "subject", email.subject(),
                "text", email.text());

        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(email.resendBaseUrl()))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + email.resendApiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return;
            }
            LOGGER.warn(
                    "Resend failed to send {} to {} from {}. HTTP {}: {}",
                    email.purpose(),
                    email.to(),
                    email.from(),
                    response.statusCode(),
                    response.body());
            throw new EmailDeliveryException(
                    email.failureMessage() + ". Email provider returned HTTP " + response.statusCode());
        } catch (JsonProcessingException e) {
            throw new EmailDeliveryException("Could not prepare email", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new EmailDeliveryException(email.failureMessage() + " because delivery was interrupted", e);
        } catch (IOException | IllegalArgumentException e) {
            LOGGER.warn(
                    "Resend failed to send {} to {} from {} using {}: {}",
                    email.purpose(),
                    email.to(),
                    email.from(),
                    email.resendBaseUrl(),
                    e.getMessage(),
                    e);
            throw new EmailDeliveryException(email.failureMessage(), e);
        }
    }
}

record OutboundEmail(
        String provider,
        String from,
        String to,
        String subject,
        String text,
        String resendApiKey,
        String resendBaseUrl,
        String purpose,
        String failureMessage) {

    OutboundEmail {
        provider = provider == null || provider.isBlank() ? "smtp" : provider.trim().toLowerCase();
    }
}
