package com.rentify.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, 
                                        HttpServletResponse response, 
                                        AuthenticationException exception) throws IOException {
        // Try to detect frontend URL from referer
        String redirectUrl = frontendUrl;
        String referer = request.getHeader("Referer");
        if (referer != null && (referer.contains("localhost:3000") || referer.contains("localhost:3001"))) {
            try {
                java.net.URL url = new java.net.URL(referer);
                redirectUrl = url.getProtocol() + "://" + url.getHost() + (url.getPort() != -1 ? ":" + url.getPort() : "");
            } catch (Exception e) {
                // Use default
            }
        }
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl + "/auth/callback")
                .queryParam("error", exception.getMessage() != null ? exception.getMessage() : "Authentication failed")
                .queryParam("success", "false")
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
