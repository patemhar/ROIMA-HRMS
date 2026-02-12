package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new UsernameNotFoundException("User not foud"));

        return new CustomUserDetails(user);
    }


}