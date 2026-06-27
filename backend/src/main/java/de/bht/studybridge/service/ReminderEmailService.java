package de.bht.studybridge.service;

import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.model.User;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.reminders.email.enabled", havingValue = "true")
public class ReminderEmailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    private final EmailDeliveryService emailDeliveryService;
    private final boolean enabled;
    private final String fromAddress;
    private final String provider;
    private final String resendApiKey;
    private final String resendBaseUrl;

    public ReminderEmailService(
            EmailDeliveryService emailDeliveryService,
            @Value("${app.reminders.email.enabled:false}") boolean enabled,
            @Value("${app.reminders.email.from:}") String fromAddress,
            @Value("${app.email-verification.from:no-reply@studybridge.local}") String fallbackFromAddress,
            @Value("${app.reminders.email.provider:}") String provider,
            @Value("${app.email-verification.provider:smtp}") String fallbackProvider,
            @Value("${app.reminders.email.resend.api-key:}") String resendApiKey,
            @Value("${app.reminders.email.resend.base-url:https://api.resend.com/emails}") String resendBaseUrl) {
        this.emailDeliveryService = emailDeliveryService;
        this.enabled = enabled;
        this.fromAddress = defaultIfBlank(fromAddress, fallbackFromAddress);
        this.provider = defaultIfBlank(provider, fallbackProvider);
        this.resendApiKey = resendApiKey;
        this.resendBaseUrl = resendBaseUrl;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void sendReminder(Reminder reminder) {
        Assignment assignment = reminder.getAssignment();
        Course course = assignment.getCourse();
        User user = course.getUser();

        String subject = "StudyBridge reminder: " + assignment.getTitle();
        String text = """
                Hi %s,

                This is your StudyBridge reminder for:

                Assignment: %s
                Course: %s (%s)
                Due date: %s
                Reminder time: %s

                Open StudyBridge to review the assignment and update your progress.
                """.formatted(
                user.getName(),
                assignment.getTitle(),
                course.getTitle(),
                course.getCourseCode(),
                assignment.getDueDate().format(DATE_FORMAT),
                reminder.getRemindAt().format(DATE_TIME_FORMAT)).trim();

        emailDeliveryService.send(new OutboundEmail(
                provider,
                fromAddress,
                user.getEmail(),
                subject,
                text,
                resendApiKey,
                resendBaseUrl,
                "reminder email",
                "Could not send reminder email"));
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
