package com.rentify.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/v1/auth/oauth2")
public class OAuth2Controller {
    
    @GetMapping("/google")
    public String googleAuth() {
        // Redirect to Spring Security's OAuth2 authorization endpoint
        return "redirect:/oauth2/authorization/google";
    }
}
