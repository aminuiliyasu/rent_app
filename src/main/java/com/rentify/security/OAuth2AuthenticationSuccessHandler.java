package com.rentify.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                       HttpServletResponse response, 
                                       Authentication authentication) throws IOException {
        try {
            System.out.println("OAuth2 Authentication Success - Processing redirect...");
            String targetUrl = determineTargetUrl(request, response, authentication);
            System.out.println("OAuth2 Redirect URL: " + targetUrl);
            
            if (response.isCommitted()) {
                logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
                return;
            }
            
            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            System.err.println("Error during OAuth2 authentication success: " + e.getMessage());
            e.printStackTrace();
            logger.error("Error during OAuth2 authentication success", e);
            // Redirect to frontend with error
            String errorUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                    .queryParam("error", "Authentication failed: " + e.getMessage())
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
    
    protected String determineTargetUrl(HttpServletRequest request, 
                                       HttpServletResponse response, 
                                       Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // Get email from attributes (set in CustomOAuth2UserService)
        String email = (String) attributes.get("internal_user_email");
        if (email == null) {
            email = (String) attributes.get("email");
        }
        
        if (email == null) {
            throw new RuntimeException("Email not found in OAuth2 attributes");
        }
        
        // Generate JWT tokens
        String accessToken = tokenProvider.generateTokenFromUsername(email);
        String refreshToken = tokenProvider.generateRefreshToken(email);
        
        // Try to detect frontend URL from referer or use default
        String redirectUrl = frontendUrl;
        String referer = request.getHeader("Referer");
        if (referer != null && (referer.contains("localhost:3000") || referer.contains("localhost:3001"))) {
            // Extract the origin from referer
            try {
                java.net.URL url = new java.net.URL(referer);
                redirectUrl = url.getProtocol() + "://" + url.getHost() + (url.getPort() != -1 ? ":" + url.getPort() : "");
            } catch (Exception e) {
                logger.warn("Could not parse referer URL: " + referer, e);
            }
        }
        
        // Build redirect URL with tokens
        return UriComponentsBuilder.fromUriString(redirectUrl + "/auth/callback")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("success", "true")
                .build().toUriString();
    }
}
