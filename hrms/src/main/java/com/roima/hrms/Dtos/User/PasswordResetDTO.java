package com.roima.hrms.dtos.User;

import lombok.Data;

@Data
public class PasswordResetDTO {
    private String newPassword;
    private String confirmPassword;
}
