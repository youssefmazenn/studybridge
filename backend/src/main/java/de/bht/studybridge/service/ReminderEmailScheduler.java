package de.bht.studybridge.service;

import de.bht.studybridge.model.Reminder;
import de.bht.studybridge.repository.ReminderRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(name = "app.reminders.email.enabled", havingValue = "true")
public class ReminderEmailScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderEmailScheduler.class);

    private final ReminderRepository reminderRepository;
    private final ReminderEmailService reminderEmailService;

    public ReminderEmailScheduler(
            ReminderRepository reminderRepository,
            ReminderEmailService reminderEmailService) {
        this.reminderRepository = reminderRepository;
        this.reminderEmailService = reminderEmailService;
    }

    @Scheduled(
            initialDelayString = "${app.reminders.email.initial-delay-ms:10000}",
            fixedDelayString = "${app.reminders.email.poll-ms:60000}")
    @Transactional
    public void sendDueReminderEmails() {
        if (!reminderEmailService.isEnabled()) {
            return;
        }

        List<Reminder> dueReminders =
                reminderRepository.findTop50BySentFalseAndRemindAtLessThanEqualOrderByRemindAtAsc(
                        LocalDateTime.now());
        for (Reminder reminder : dueReminders) {
            try {
                reminderEmailService.sendReminder(reminder);
                reminder.setSent(true);
            } catch (MailException e) {
                log.warn("Could not send reminder email for reminder {}", reminder.getId(), e);
            }
        }
    }
}
