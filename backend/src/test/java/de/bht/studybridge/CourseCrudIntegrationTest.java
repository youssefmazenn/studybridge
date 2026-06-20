package de.bht.studybridge;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.dto.CourseRequest;
import de.bht.studybridge.dto.RegisterRequest;
import java.nio.charset.StandardCharsets;
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
class CourseCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String bearerToken;

    @BeforeEach
    void registerAndLogin() throws Exception {
        String email = "course-crud-" + System.nanoTime() + "@example.com";
        RegisterRequest register = new RegisterRequest();
        register.setName("Course Tester");
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

        String body = loginResult.getResponse().getContentAsString();
        bearerToken = objectMapper.readTree(body).get("accessToken").asText();
    }

    @Test
    void courseCrudLifecycle() throws Exception {
        CourseRequest request = new CourseRequest();
        request.setTitle("Enterprise Web Development");
        request.setCourseCode("EWD");
        request.setSemester("SS 2026");
        request.setInstructor("Prof. von Klinski");

        MvcResult createResult = mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Enterprise Web Development"))
                .andExpect(jsonPath("$.courseCode").value("EWD"))
                .andReturn();

        long courseId = objectMapper
                .readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/v1/courses").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(get("/api/v1/courses/" + courseId).header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.semester").value("SS 2026"));

        request.setTitle("EWD Updated");
        mockMvc.perform(put("/api/v1/courses/" + courseId)
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("EWD Updated"));

        mockMvc.perform(delete("/api/v1/courses/" + courseId).header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/courses").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createCourseWithoutInstructor() throws Exception {
        String json =
                """
                {"title":"Optional Instructor Course","courseCode":"OIC","semester":"WS 2026"}
                """;

        mockMvc.perform(post("/api/v1/courses")
                        .header("Authorization", "Bearer " + bearerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Optional Instructor Course"))
                .andExpect(jsonPath("$.instructor").doesNotExist());
    }

    @Test
    void listCoursesWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/courses")).andExpect(status().isUnauthorized());
    }

    @Test
    void getUnknownCourseReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/courses/99999").header("Authorization", "Bearer " + bearerToken))
                .andExpect(status().isNotFound());
    }
}
