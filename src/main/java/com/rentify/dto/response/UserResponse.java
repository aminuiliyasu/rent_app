package com.rentify.dto.response;

import com.rentify.model.enums.KycStatus;
import com.rentify.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private KycStatus kycStatus;
    private String avatarUrl;
    private Boolean emailVerified;
    private Boolean phoneVerified;
}
