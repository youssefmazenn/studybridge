package de.bht.studybridge;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.dto.AssignmentRequest;
import de.bht.studybridge.dto.CourseRequest;
import de.bht.studybridge.dto.RegisterRequest;
import de.bht.studybridge.dto.ReminderRequest;
import de.bht.studybridge.model.ReminderType;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ReminderCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String bearerToken;
    private long assignmentId;

    @BeforeEach
    void setupUserCourseAndAssignment() throws Exception {
        String email = "reminder-crud-" + System.nanoTime() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setName("Reminder Tester");
        register.setEmail(email);
        register.setPassword("password123");
        register.setPreferredLanguage("English");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        String basic = Base64.getEncoder()
                .encodeToString((email + ":password123").getBytes(StandardCharsets.UTF_8));

        MvcResult loginResult = mockMvc.perform(get("/api/v1/auth/login")
                        .header("Authorization", "Basic " + basic))
                .andExpect(status().isOk())
                .andReturn();

        bearerToken = objectMapper
                .readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken")
                .asText();

        CourseRequest course = new CourseRequest();
        course.setTitle("Course");
        course.setCourseCode("REM101");
        course.setSemester("SS 2026");

        MvcResult courseResult = mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isCreated())
                .andReturn();

        long courseId = objectMapper
                .readTree(courseResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        AssignmentRequest assignment = new AssignmentRequest();
        assignment.setCourseId(courseId);
        assignment.setTitle("Final report");
        assignment.setDueDate(LocalDate.of(2026, 12, 1));

        MvcResult assignmentResult = mockMvc.perform(post("/api/v1/assignments")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignment)))
                .andExpect(status().isCreated())
                .andReturn();

        assignmentId = objectMapper
                .readTree(assignmentResult.getResponse().getContentAsString())
                .get("id")
                .asLong();
    }

    @Test
    void reminderCrudLifecycle() throws Exception {
        ReminderRequest request = new ReminderRequest();
        request.setReminderType(ReminderType.ONE_DAY_BEFORE);
        request.setRemindAt(LocalDateTime.of(2026, 11, 30, 9, 0));

        MvcResult createResult = mockMvc.perform(post("/api/v1/assignments/" + assignmentId + "/reminders")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reminderType").value("ONE_DAY_BEFORE"))
                .andExpect(jsonPath("$.sent").value(false))
                .andReturn();

        long reminderId = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/v1/assignments/" + assignmentId + "/reminders")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/v1/reminders").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        request.setReminderType(ReminderType.CUSTOM);
        request.setRemindAt(LocalDateTime.of(2026, 11, 28, 12, 0));
        mockMvc.perform(put("/api/v1/reminders/" + reminderId)
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reminderType").value("CUSTOM"));

        mockMvc.perform(patch("/api/v1/reminders/" + reminderId + "/sent?sent=true")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sent").value(true));

        mockMvc.perform(delete("/api/v1/reminders/" + reminderId)
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isNoContent());
    }
}
