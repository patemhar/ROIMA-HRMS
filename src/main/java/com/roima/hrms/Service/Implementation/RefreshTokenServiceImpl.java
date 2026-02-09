package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.RefreshTokenRepository;
import com.roima.hrms.Service.Interfaces.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Override
    public void save(String token, User user) {
        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(token);
        entity.setUser(user);
        entity.setUserMail(user.getEmail());
        repository.save(entity);
    }

    @Override
    public void validate(String token) {
        RefreshToken rt = repository
                .findByTokenHash(token)
                .orElseThrow();

        if (rt.getRevoked_at() != null) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    @Override
    public void revoke(String token, String reason) {
        repository.findByTokenHash(token)
                .ifPresent(rt -> {
                    rt.setRevoked_at(LocalDateTime.now());
                    rt.setReason_revoked(reason);
                    repository.save(rt);
                });
    }
}

//
//public interface UserService {
//
//    UserResponse getCurrentUser();
//
//    UserResponse createUser(CreateUserRequest request);
//}
//
//
//@Service
//@RequiredArgsConstructor
//public class UserServiceImpl implements UserService {
//
//    private final UserRepository userRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final RoleRepository roleRepository;
//
//    @Override
//    public UserResponse getCurrentUser() {
//
//        Authentication auth =
//                SecurityContextHolder.getContext().getAuthentication();
//
//        CustomUserDetails user =
//                (CustomUserDetails) auth.getPrincipal();
//
//        return mapToResponse(user.getUser());
//    }
//
//    @Override
//    public UserResponse createUser(CreateUserRequest request) {
//
//        Role role = roleRepository
//                .findByName(request.getRole())
//                .orElseThrow();
//
//        User user = new User();
//        user.setEmail(request.getEmail());
//        user.setPassword(
//                passwordEncoder.encode(request.getPassword())
//        );
//        user.setRole(role);
//
//        userRepository.save(user);
//
//        return mapToResponse(user);
//    }
//}
