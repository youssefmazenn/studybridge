package de.bht.studybridge.security;

import de.bht.studybridge.repository.UserRepository;
import de.bht.studybridge.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ApiErrorWriter apiErrorWriter;

    public JwtAuthenticationFilter(
            JwtService jwtService, UserRepository userRepository, ApiErrorWriter apiErrorWriter) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.apiErrorWriter = apiErrorWriter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return PublicApiRequestMatcher.isPublic(request);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        var authentication = jwtService.parseToken(token);
        if (authentication == null) {
            apiErrorWriter.writeJson(
                    request, response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            return;
        }
        var user = userRepository.findByEmail(authentication.getName());
        if (user.isEmpty() || !user.get().isEnabled()) {
            apiErrorWriter.writeJson(
                    request, response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            return;
        }
        var currentAuthentication = new UsernamePasswordAuthenticationToken(
                user.get().getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.get().getRole().name())));
        SecurityContextHolder.getContext().setAuthentication(currentAuthentication);
        filterChain.doFilter(request, response);
    }
}
