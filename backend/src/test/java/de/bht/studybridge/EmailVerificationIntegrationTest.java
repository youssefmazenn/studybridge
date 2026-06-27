package de.bht.studybridge;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.dto.RegisterRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.email-verification.enabled=true",
        "app.frontend.base-url=http://localhost:5173"
})
@AutoConfigureMockMvc
class EmailVerificationIntegrationTest {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("token=([A-Za-z0-9_-]+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void userMustVerifyEmailBeforeLogin() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setName("Verify Tester");
        register.setEmail("verify-user@example.com");
        register.setPassword("password123");
        register.setPreferredLanguage("English");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("verify-user@example.com"))
                .andExpect(jsonPath("$.emailVerified").value(false));

        mockMvc.perform(get("/api/v1/auth/login")
                        .header("Authorization", "Basic " + basic("verify-user@example.com")))
                .andExpect(status().isForbidden());

        String token = capturedVerificationToken();

        mockMvc.perform(get("/api/v1/auth/verify-email").param("token", token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/auth/login")
                        .header("Authorization", "Basic " + basic("verify-user@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.emailVerified").value(true));
    }

    private String capturedVerificationToken() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        String body = captor.getValue().getText();
        Matcher matcher = TOKEN_PATTERN.matcher(body == null ? "" : body);
        if (!matcher.find()) {
            throw new AssertionError("Verification token was not present in email body");
        }
        return matcher.group(1);
    }

    private String basic(String email) {
        String credentials = email + ":password123";
        return Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }
}
