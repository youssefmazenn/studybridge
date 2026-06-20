package de.bht.studybridge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bht.studybridge.exception.BadRequestException;
import de.bht.studybridge.exception.TranslationProviderException;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.HtmlUtils;

@Service
public class TranslationClient {

    private static final int DEFAULT_CHUNK_SIZE = 450;

    private static final Map<String, String> LANGUAGE_CODES = Map.ofEntries(
            Map.entry("arabic", "ar"),
            Map.entry("arabisch", "ar"),
            Map.entry("chinese", "zh"),
            Map.entry("danish", "da"),
            Map.entry("deutsch", "de"),
            Map.entry("dutch", "nl"),
            Map.entry("englisch", "en"),
            Map.entry("english", "en"),
            Map.entry("finnish", "fi"),
            Map.entry("french", "fr"),
            Map.entry("französisch", "fr"),
            Map.entry("german", "de"),
            Map.entry("greek", "el"),
            Map.entry("hindi", "hi"),
            Map.entry("italian", "it"),
            Map.entry("italienisch", "it"),
            Map.entry("japanese", "ja"),
            Map.entry("korean", "ko"),
            Map.entry("norwegian", "no"),
            Map.entry("polish", "pl"),
            Map.entry("portuguese", "pt"),
            Map.entry("russian", "ru"),
            Map.entry("spanish", "es"),
            Map.entry("spanisch", "es"),
            Map.entry("swedish", "sv"),
            Map.entry("turkish", "tr"),
            Map.entry("ukrainian", "uk"),
            Map.entry("urdu", "ur"));

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String provider;
    private final int maxCharacters;
    private final String contactEmail;
    private final String deeplApiKey;
    private final String deeplBaseUrlOverride;

    public TranslationClient(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${app.translation.provider:deepl}") String provider,
            @Value("${app.translation.mymemory.base-url:https://api.mymemory.translated.net}") String baseUrl,
            @Value("${app.translation.max-characters:8000}") int maxCharacters,
            @Value("${app.translation.mymemory.email:}") String contactEmail,
            @Value("${app.translation.deepl.api-key:}") String deeplApiKey,
            @Value("${app.translation.deepl.base-url:}") String deeplBaseUrlOverride) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.baseUrl = stripTrailingSlash(baseUrl);
        this.provider = provider.trim().toLowerCase(Locale.ROOT);
        this.maxCharacters = maxCharacters;
        this.contactEmail = contactEmail == null ? "" : contactEmail.trim();
        this.deeplApiKey = deeplApiKey == null ? "" : deeplApiKey.trim();
        this.deeplBaseUrlOverride = deeplBaseUrlOverride == null ? "" : stripTrailingSlash(deeplBaseUrlOverride);
    }

    public String translate(String sourceText, String sourceLanguage, String targetLanguage) {
        String normalizedSource = normalizeText(sourceText);
        if (normalizedSource.length() > maxCharacters) {
            throw new BadRequestException(
                    "Document text is too long to translate. Please upload a shorter document.");
        }

        String sourceCode = resolveLanguageCode(sourceLanguage, "original language");
        String targetCode = resolveLanguageCode(targetLanguage, "target language");
        if (sourceCode.equals(targetCode)) {
            return normalizedSource;
        }

        return switch (provider) {
            case "local" -> localDevelopmentDraft(normalizedSource, sourceLanguage, targetLanguage);
            case "deepl" -> translateWithDeepL(normalizedSource, sourceCode, targetCode);
            case "mymemory" -> translateWithMyMemory(normalizedSource, sourceCode, targetCode);
            default -> throw new TranslationProviderException("Unsupported translation provider: " + provider);
        };
    }

    private String translateWithDeepL(String sourceText, String sourceCode, String targetCode) {
        if (deeplApiKey.isBlank()) {
            throw new TranslationProviderException(
                    "DeepL is selected but no API key is configured. Set app.translation.deepl.api-key "
                            + "(for example via DEEPL_API_KEY in backend/.env).");
        }
        // One request per page: DeepL handles full pages comfortably, so no character chunking is needed.
        String endpoint = resolveDeeplEndpoint() + "/v2/translate";
        String form = "text=" + encodeQueryParam(sourceText)
                + "&source_lang=" + encodeQueryParam(deeplSourceLang(sourceCode))
                + "&target_lang=" + encodeQueryParam(deeplTargetLang(targetCode));
        try {
            HttpResult result = restClient.post()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "DeepL-Auth-Key " + deeplApiKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .exchange((request, response) ->
                            new HttpResult(response.getStatusCode().value(), response.bodyTo(String.class)));
            if (result.status() >= 400) {
                throw new TranslationProviderException(describeDeeplFailure(result));
            }
            JsonNode root = objectMapper.readTree(result.body());
            String translated = root.path("translations").path(0).path("text").asText("");
            if (translated.isBlank()) {
                throw new TranslationProviderException("DeepL returned an empty translation");
            }
            return translated.trim();
        } catch (TranslationProviderException e) {
            throw e;
        } catch (RestClientException e) {
            throw new TranslationProviderException("Translation provider is currently unavailable", e);
        } catch (Exception e) {
            throw new TranslationProviderException("Could not complete translation provider request", e);
        }
    }

    /**
     * DeepL serves Free-tier keys (suffix {@code :fx}) from a different host than Pro keys. An explicit
     * override always wins so the endpoint can be pointed at a mock in tests.
     */
    private String resolveDeeplEndpoint() {
        if (!deeplBaseUrlOverride.isBlank()) {
            return deeplBaseUrlOverride;
        }
        return deeplApiKey.endsWith(":fx")
                ? "https://api-free.deepl.com"
                : "https://api.deepl.com";
    }

    private String describeDeeplFailure(HttpResult result) {
        String message = "";
        try {
            message = objectMapper.readTree(result.body()).path("message").asText("").trim();
        } catch (Exception ignored) {
            // Body was not JSON; fall back to a status-based message below.
        }
        return switch (result.status()) {
            case 403 -> "DeepL rejected the API key. Check app.translation.deepl.api-key.";
            case 429 -> "Too many requests to DeepL. Please wait a moment and try again.";
            case 456 -> "The DeepL character quota for this billing period has been used up.";
            default -> message.isBlank()
                    ? "DeepL rejected the request (HTTP " + result.status() + ")"
                    : message;
        };
    }

    private record HttpResult(int status, String body) {
    }

    private String translateWithMyMemory(String sourceText, String sourceCode, String targetCode) {
        List<String> translatedChunks = new ArrayList<>();
        for (String chunk : splitIntoChunks(sourceText)) {
            translatedChunks.add(requestMyMemory(chunk, sourceCode, targetCode));
        }
        return String.join("\n\n", translatedChunks).trim();
    }

    private String requestMyMemory(String chunk, String sourceCode, String targetCode) {
        try {
            StringBuilder query = new StringBuilder("%s/get?q=%s&langpair=%s".formatted(
                    baseUrl,
                    encodeQueryParam(chunk),
                    encodeQueryParam(sourceCode + "|" + targetCode)));
            if (!contactEmail.isBlank()) {
                // MyMemory raises the free daily limit (~5k -> ~50k words) when a valid email is sent.
                query.append("&de=").append(encodeQueryParam(contactEmail));
            }
            URI uri = URI.create(query.toString());
            // Use exchange() so a 4xx (e.g. 429 quota) does not throw before we can read MyMemory's
            // explanatory JSON body, which carries the real reason for the failure.
            String body = restClient.get()
                    .uri(uri)
                    .exchange((request, response) -> response.bodyTo(String.class));
            if (body == null || body.isBlank()) {
                throw new TranslationProviderException("Translation provider returned an empty response");
            }
            JsonNode root = objectMapper.readTree(body);
            int responseStatus = root.path("responseStatus").asInt(200);
            String translatedText = root.path("responseData").path("translatedText").asText("");
            if (responseStatus >= 400 || translatedText.isBlank()) {
                throw new TranslationProviderException(describeFailure(responseStatus, root));
            }
            return HtmlUtils.htmlUnescape(translatedText).trim();
        } catch (TranslationProviderException e) {
            throw e;
        } catch (RestClientException e) {
            throw new TranslationProviderException("Translation provider is currently unavailable", e);
        } catch (Exception e) {
            throw new TranslationProviderException("Could not complete translation provider request", e);
        }
    }

    private static String describeFailure(int responseStatus, JsonNode root) {
        String details = root.path("responseDetails").asText("").trim();
        if (responseStatus == 429 || details.toUpperCase(Locale.ROOT).contains("FREE TRANSLATIONS")) {
            return "The free translation quota for today has been used up. It resets after a few hours. "
                    + "To raise the daily limit, set app.translation.mymemory.email to a valid email address.";
        }
        return details.isBlank() ? "Translation provider rejected the request" : details;
    }

    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        String[] paragraphs = text.split("\\R\\s*\\R");
        StringBuilder current = new StringBuilder();
        for (String paragraph : paragraphs) {
            for (String part : splitLongParagraph(paragraph.trim())) {
                if (part.isBlank()) {
                    continue;
                }
                if (current.length() + part.length() + 2 > DEFAULT_CHUNK_SIZE && !current.isEmpty()) {
                    chunks.add(current.toString());
                    current.setLength(0);
                }
                if (!current.isEmpty()) {
                    current.append("\n\n");
                }
                current.append(part);
            }
        }
        if (!current.isEmpty()) {
            chunks.add(current.toString());
        }
        return chunks;
    }

    private List<String> splitLongParagraph(String paragraph) {
        List<String> parts = new ArrayList<>();
        String remaining = paragraph;
        while (remaining.length() > DEFAULT_CHUNK_SIZE) {
            int splitAt = remaining.lastIndexOf(' ', DEFAULT_CHUNK_SIZE);
            if (splitAt < DEFAULT_CHUNK_SIZE / 2) {
                splitAt = DEFAULT_CHUNK_SIZE;
            }
            parts.add(remaining.substring(0, splitAt).trim());
            remaining = remaining.substring(splitAt).trim();
        }
        if (!remaining.isBlank()) {
            parts.add(remaining);
        }
        return parts;
    }

    private static String resolveLanguageCode(String language, String label) {
        if (language == null || language.trim().isEmpty()) {
            throw new BadRequestException("The " + label + " is required");
        }
        String normalized = language.trim().toLowerCase(Locale.ROOT);
        if (normalized.matches("[a-z]{2}(-[a-z]{2})?")) {
            return normalized;
        }
        String code = LANGUAGE_CODES.get(normalized);
        if (code == null) {
            throw new BadRequestException(
                    "Unsupported " + label + ": " + language + ". Use a language name like English or German.");
        }
        return code;
    }

    /**
     * DeepL source languages are the bare uppercase language (no region). Norwegian is "NB" at DeepL.
     */
    private static String deeplSourceLang(String code) {
        String base = code.split("-", 2)[0].toUpperCase(Locale.ROOT);
        return base.equals("NO") ? "NB" : base;
    }

    /**
     * DeepL deprecated the region-less "EN" and "PT" target codes, so pin sensible defaults. Any
     * region the caller already supplied (for example "en-gb") is preserved.
     */
    private static String deeplTargetLang(String code) {
        String upper = code.toUpperCase(Locale.ROOT);
        if (upper.contains("-")) {
            return upper;
        }
        return switch (upper) {
            case "EN" -> "EN-US";
            case "PT" -> "PT-PT";
            case "NO" -> "NB";
            default -> upper;
        };
    }

    private static String normalizeText(String text) {
        return text == null ? "" : text.replace("\r\n", "\n").replaceAll("[ \\t]+", " ").trim();
    }

    private static String encodeQueryParam(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String stripTrailingSlash(String value) {
        String trimmed = value.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static String localDevelopmentDraft(
            String sourceText, String sourceLanguage, String targetLanguage) {
        return """
                Local translation mode is enabled.
                Source: %s
                Target: %s

                %s
                """.formatted(sourceLanguage, targetLanguage, sourceText).trim();
    }
}
