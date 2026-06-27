package de.bht.studybridge.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import de.bht.studybridge.exception.EmailDeliveryException;
import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.repository.ReminderRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;

@ExtendWith(MockitoExtension.class)
class ReminderEmailSchedulerTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private ReminderEmailService reminderEmailService;

    @Test
    void marksReminderSentAfterSuccessfulDelivery() {
        Reminder reminder = new Reminder();
        when(reminderEmailService.isEnabled()).thenReturn(true);
        when(reminderRepository
                        .findTop50BySentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
                                any(LocalDateTime.class)))
                .thenReturn(List.of(reminder));

        scheduler().sendDueReminderEmails();

        verify(reminderEmailService).sendReminder(reminder);
        assertThat(reminder.isSent()).isTrue();
    }

    @Test
    void leavesReminderUnsentWhenDeliveryFails() {
        Reminder reminder = new Reminder();
        reminder.setId(42L);
        when(reminderEmailService.isEnabled()).thenReturn(true);
        when(reminderRepository
                        .findTop50BySentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
                                any(LocalDateTime.class)))
                .thenReturn(List.of(reminder));
        doThrow(new MailSendException("SMTP unavailable"))
                .when(reminderEmailService)
                .sendReminder(reminder);

        scheduler().sendDueReminderEmails();

        assertThat(reminder.isSent()).isFalse();
    }

    @Test
    void leavesReminderUnsentWhenResendDeliveryFails() {
        Reminder reminder = new Reminder();
        reminder.setId(43L);
        when(reminderEmailService.isEnabled()).thenReturn(true);
        when(reminderRepository
                        .findTop50BySentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
                                any(LocalDateTime.class)))
                .thenReturn(List.of(reminder));
        doThrow(new EmailDeliveryException("Resend unavailable"))
                .when(reminderEmailService)
                .sendReminder(reminder);

        scheduler().sendDueReminderEmails();

        assertThat(reminder.isSent()).isFalse();
    }

    @Test
    void doesNothingWhenEmailDeliveryIsDisabled() {
        when(reminderEmailService.isEnabled()).thenReturn(false);

        scheduler().sendDueReminderEmails();

        verifyNoInteractions(reminderRepository);
        verify(reminderEmailService, never()).sendReminder(any());
    }

    private ReminderEmailScheduler scheduler() {
        return new ReminderEmailScheduler(reminderRepository, reminderEmailService);
    }
}
