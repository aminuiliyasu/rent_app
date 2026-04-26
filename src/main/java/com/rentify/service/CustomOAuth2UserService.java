package com.rentify.service;

import com.rentify.model.User;
import com.rentify.model.enums.KycStatus;
import com.rentify.model.enums.UserRole;
import com.rentify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@Service("customOAuth2UserService")
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
            
            String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
            Map<String, Object> attributes = oAuth2User.getAttributes();
            
            System.out.println("OAuth2 User Attributes: " + attributes);
            
            User user = processOAuth2User(registrationId, attributes);
            
            // Store user ID in attributes for later retrieval
            Map<String, Object> userAttributes = oAuth2User.getAttributes();
            userAttributes.put("internal_user_id", user.getId());
            userAttributes.put("internal_user_email", user.getEmail());
            
            GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
            
            String userNameAttributeName = oAuth2UserRequest.getClientRegistration()
                    .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
            
            System.out.println("OAuth2 User processed successfully: " + user.getEmail());
            
            return new DefaultOAuth2User(
                Collections.singletonList(authority),
                userAttributes,
                userNameAttributeName
            );
        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error in OAuth2 loadUser: " + e.getMessage());
            e.printStackTrace();
            OAuth2Error oauth2Error = new OAuth2Error("oauth2_user_load_error", "Failed to load OAuth2 user: " + e.getMessage(), null);
            throw new OAuth2AuthenticationException(oauth2Error, e);
        }
    }
    
    private User processOAuth2User(String registrationId, Map<String, Object> attributes) {
        if (!"google".equals(registrationId)) {
            OAuth2Error oauth2Error = new OAuth2Error("unsupported_provider", "Only Google OAuth2 is supported", null);
            throw new OAuth2AuthenticationException(oauth2Error);
        }
        
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String oauthId = (String) attributes.get("sub");
        String avatarUrl = null;
        
        // Google returns picture as a String URL directly
        Object pictureObj = attributes.get("picture");
        if (pictureObj instanceof String) {
            avatarUrl = (String) pictureObj;
        } else if (pictureObj instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> picture = (Map<String, Object>) pictureObj;
            avatarUrl = (String) picture.get("url");
        }
        
        if (email == null || email.isEmpty()) {
            OAuth2Error oauth2Error = new OAuth2Error("missing_email", "Email not found from Google OAuth2 provider", null);
            throw new OAuth2AuthenticationException(oauth2Error);
        }
        
        User user;
        
        // Check if user exists by email
        user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            // Update Google ID if not set
            if (user.getGoogleId() == null) {
                user.setGoogleId(oauthId);
            }
            
            // Update avatar if available
            if (avatarUrl != null && user.getAvatarUrl() == null) {
                user.setAvatarUrl(avatarUrl);
            }
            
            user.setEmailVerified(true);
            user = userRepository.save(user);
        } else {
            // Check if user exists by Google ID
            user = userRepository.findByGoogleId(oauthId).orElse(null);
            
            if (user == null) {
                // Create new user
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setAvatarUrl(avatarUrl);
                user.setEmailVerified(true);
                user.setPhoneVerified(false);
                user.setRole(UserRole.RENTER);
                user.setKycStatus(KycStatus.NOT_REQUIRED);
                user.setIsActive(true);
                user.setIsBanned(false);
                user.setGoogleId(oauthId);
                
                user = userRepository.save(user);
            }
        }
        
        return user;
    }
}
