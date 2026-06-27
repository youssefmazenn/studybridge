package de.bht.studybridge.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import de.bht.studybridge.model.Assignment;
import de.bht.studybridge.model.Course;
import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.model.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReminderEmailServiceTest {

    @Mock
    private EmailDeliveryService emailDeliveryService;

    @Test
    void sendsReminderToCourseOwnerWithAssignmentDetails() {
        ReminderEmailService service = new ReminderEmailService(
                emailDeliveryService,
                true,
                "reminders@studybridge.example",
                "fallback@studybridge.example",
                "resend",
                "smtp",
                "test-api-key",
                "https://api.resend.com/emails");
        Reminder reminder = reminder();

        service.sendReminder(reminder);

        ArgumentCaptor<OutboundEmail> messageCaptor =
                ArgumentCaptor.forClass(OutboundEmail.class);
        verify(emailDeliveryService).send(messageCaptor.capture());

        OutboundEmail message = messageCaptor.getValue();
        assertThat(message.provider()).isEqualTo("resend");
        assertThat(message.from()).isEqualTo("reminders@studybridge.example");
        assertThat(message.to()).isEqualTo("alex@example.com");
        assertThat(message.subject()).isEqualTo("StudyBridge reminder: Final report");
        assertThat(message.text())
                .contains("Hi Alex Morgan")
                .contains("Assignment: Final report")
                .contains("Course: Enterprise Web Development (EWD)")
                .contains("Due date: 30 Jun 2026")
                .contains("Reminder time: 24 Jun 2026 15:30");
    }

    private Reminder reminder() {
        User user = new User();
        user.setName("Alex Morgan");
        user.setEmail("alex@example.com");

        Course course = new Course();
        course.setTitle("Enterprise Web Development");
        course.setCourseCode("EWD");
        course.setUser(user);

        Assignment assignment = new Assignment();
        assignment.setTitle("Final report");
        assignment.setDueDate(LocalDate.of(2026, 6, 30));
        assignment.setCourse(course);

        Reminder reminder = new Reminder();
        reminder.setAssignment(assignment);
        reminder.setRemindAt(LocalDateTime.of(2026, 6, 24, 15, 30));
        return reminder;
    }
}
