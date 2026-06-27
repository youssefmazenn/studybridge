package de.bht.studybridge;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.dto.AdminUserEnabledRequest;
import de.bht.studybridge.dto.RegisterRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = "app.admin.emails=admin-management@example.com")
@AutoConfigureMockMvc
class AdminUserManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void adminCanDeactivateAndDeleteUsers() throws Exception {
        register("Admin Manager", "admin-management@example.com");
        Long userId = register("Managed User", "managed-user@example.com");

        String adminToken = login("admin-management@example.com");
        String userToken = login("managed-user@example.com");

        mockMvc.perform(get("/api/v1/admin/users").header(HttpHeaders.AUTHORIZATION, bearer(userToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/users").header(HttpHeaders.AUTHORIZATION, bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].email", hasItem("admin-management@example.com")))
                .andExpect(jsonPath("$[*].email", hasItem("managed-user@example.com")))
                .andExpect(jsonPath("$[?(@.email == 'admin-management@example.com')].role", hasItem("ADMIN")));

        AdminUserEnabledRequest disableRequest = new AdminUserEnabledRequest();
        disableRequest.setEnabled(false);

        mockMvc.perform(patch("/api/v1/admin/users/{id}/enabled", userId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        mockMvc.perform(get("/api/v1/users/me").header(HttpHeaders.AUTHORIZATION, bearer(userToken)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/auth/login").header(HttpHeaders.AUTHORIZATION, basic("managed-user@example.com")))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(delete("/api/v1/admin/users/{id}", userId)
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken)))
                .andExpect(status().isNoContent());
    }

    private Long register(String name, String email) throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setName(name);
        register.setEmail(email);
        register.setPassword("password123");
        register.setPreferredLanguage("English");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private String login(String email) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/auth/login")
                        .header(HttpHeaders.AUTHORIZATION, basic(email)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken")
                .asText();
    }

    private String basic(String email) {
        String credentials = email + ":password123";
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
