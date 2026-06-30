package com.rentify.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendUrl.replaceAll("/$", "") + "/reset-password?token=" + token;
        String subject = "Reset your Rhentify password";
        String body = "We received a request to reset your Rhentify password.\n\n"
                + "Open this link within 1 hour:\n" + link + "\n\n"
                + "If you did not request this, you can ignore this email.";

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.info("Mail not configured — password reset link for {}: {}", to, link);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
