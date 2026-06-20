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
import de.bht.studybridge.dto.AssignmentStatusUpdateRequest;
import de.bht.studybridge.dto.CourseRequest;
import de.bht.studybridge.dto.RegisterRequest;
import de.bht.studybridge.model.AssignmentStatus;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
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
class AssignmentCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String bearerToken;
    private long courseId;

    @BeforeEach
    void registerLoginAndCreateCourse() throws Exception {
        String email = "assignment-crud-" + System.nanoTime() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setName("Assignment Tester");
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
        course.setTitle("Test Course");
        course.setCourseCode("TC101");
        course.setSemester("SS 2026");

        MvcResult courseResult = mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(course)))
                .andExpect(status().isCreated())
                .andReturn();

        courseId = objectMapper
                .readTree(courseResult.getResponse().getContentAsString())
                .get("id")
                .asLong();
    }

    @Test
    void assignmentCrudLifecycle() throws Exception {
        AssignmentRequest request = new AssignmentRequest();
        request.setCourseId(courseId);
        request.setTitle("Milestone 2 Essay");
        request.setDescription("Write about REST APIs");
        request.setDueDate(LocalDate.of(2026, 6, 15));

        MvcResult createResult = mockMvc.perform(post("/api/v1/assignments")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Milestone 2 Essay"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.courseCode").value("TC101"))
                .andReturn();

        long assignmentId = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/v1/assignments").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/v1/assignments?status=PENDING")
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        AssignmentStatusUpdateRequest statusUpdate = new AssignmentStatusUpdateRequest();
        statusUpdate.setStatus(AssignmentStatus.COMPLETED);
        mockMvc.perform(patch("/api/v1/assignments/" + assignmentId + "/status")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        request.setTitle("Milestone 2 Essay (revised)");
        mockMvc.perform(put("/api/v1/assignments/" + assignmentId)
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Milestone 2 Essay (revised)"));

        mockMvc.perform(delete("/api/v1/assignments/" + assignmentId)
                        .header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/assignments").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void listAssignmentsWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/assignments")).andExpect(status().isUnauthorized());
    }
}
