package de.bht.studybridge.security;

import jakarta.servlet.http.HttpServletRequest;

public final class PublicApiRequestMatcher {

    private PublicApiRequestMatcher() {
    }

    public static boolean isPublic(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        if (path.startsWith("/h2-console")) {
            return true;
        }
        if ("POST".equalsIgnoreCase(method) && "/api/v1/auth/register".equals(path)) {
            return true;
        }
        return "GET".equalsIgnoreCase(method) && "/api/v1/auth/login".equals(path);
    }
}
