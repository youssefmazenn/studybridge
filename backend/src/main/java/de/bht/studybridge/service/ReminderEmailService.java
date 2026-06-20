package de.bht.studybridge.service;

import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.model.User;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.reminders.email.enabled", havingValue = "true")
public class ReminderEmailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String fromAddress;

    public ReminderEmailService(
            JavaMailSender mailSender,
            @Value("${app.reminders.email.enabled:false}") boolean enabled,
            @Value("${app.reminders.email.from:no-reply@studybridge.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.fromAddress = fromAddress;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void sendReminder(Reminder reminder) {
        Assignment assignment = reminder.getAssignment();
        Course course = assignment.getCourse();
        User user = course.getUser();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("StudyBridge reminder: " + assignment.getTitle());
        message.setText("""
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
                reminder.getRemindAt().format(DATE_TIME_FORMAT)).trim());

        try {
            mailSender.send(message);
        } catch (MailException e) {
            throw e;
        }
    }
}
