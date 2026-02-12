package com.roima.hrms.Utility;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        String userId;

        if (principal instanceof UserDetails userDetails) {
            userId = userDetails.getUsername();
        } else {
            userId = principal.toString();
        }

        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
