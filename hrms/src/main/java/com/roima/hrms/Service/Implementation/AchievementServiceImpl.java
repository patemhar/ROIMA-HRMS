package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Post;
import com.roima.hrms.Core.Entities.Profile;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.achievement.PostDto;
import com.roima.hrms.Mapper.PostMapper;
import com.roima.hrms.Repositories.PostRepository;
import com.roima.hrms.Repositories.ProfileRepository;
import com.roima.hrms.Service.Interfaces.AchievementService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AchievementServiceImpl implements AchievementService {

    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;
    private final PostMapper postMapper;
    private final SecurityUtil securityUtil;

    @Override
    public List<PostDto> getAchievementFeed() {
        User currentUser = securityUtil.getCurrentUser();
        String roleName = currentUser.getRole().getName();

        List<String> allowedRoles;
        switch (roleName) {
            case "HR":
                allowedRoles = List.of("EMPLOYEE", "MANAGER", "HR");
                break;
            case "MANAGER":
                allowedRoles = List.of("EMPLOYEE", "MANAGER");
                break;
            case "EMPLOYEE":
                allowedRoles = List.of("EMPLOYEE");
                break;
            default:
                allowedRoles = List.of();
        }

        List<Post> posts = postRepository.findActivePostsByVisibility(allowedRoles);
        return posts.stream().map(post -> postMapper.toDto(post, currentUser)).collect(Collectors.toList());
    }

    @Override
    public void generateBirthdayPosts() {
        LocalDate today = LocalDate.now();
        List<Profile> profiles = profileRepository.findAll();

        for (Profile profile : profiles) {
            if (profile.getDate_of_birth() != null &&
                profile.getDate_of_birth().getMonth() == today.getMonth() &&
                profile.getDate_of_birth().getDayOfMonth() == today.getDayOfMonth()) {

                // Check if post already exists for today
                boolean exists = postRepository.findAllActivePosts().stream()
                    .anyMatch(p -> p.isSystemGenerated() &&
                                   p.getTitle().contains("birthday") &&
                                   p.getContent().contains(profile.getUser().getFirst_name()));

                if (!exists) {
                    Post post = new Post();
                    post.setPostOwner(null); // System post
                    post.setTitle("Birthday Celebration");
                    post.setContent("Today is " + profile.getUser().getFirst_name() + " " + profile.getUser().getLast_name() + "'s birthday! 🎉");
                    post.setTags("birthday");
                    post.setSystemGenerated(true);
                    post.setActive(true);
                    post.setVisibility_role(null); // All

                    postRepository.save(post);
                }
            }
        }
    }

    @Override
    public void generateAnniversaryPosts() {
        LocalDate today = LocalDate.now();
        List<Profile> profiles = profileRepository.findAll();

        for (Profile profile : profiles) {
            if (profile.getJoined_date() != null) {
                Period period = Period.between(profile.getJoined_date(), today);
                int years = period.getYears();

                if (years > 0 &&
                    profile.getJoined_date().getMonth() == today.getMonth() &&
                    profile.getJoined_date().getDayOfMonth() == today.getDayOfMonth()) {

                    // Check if post already exists for today
                    boolean exists = postRepository.findAllActivePosts().stream()
                        .anyMatch(p -> p.isSystemGenerated() &&
                                       p.getTitle().contains("anniversary") &&
                                       p.getContent().contains(profile.getUser().getFirst_name()) &&
                                       p.getContent().contains(String.valueOf(years)));

                    if (!exists) {
                        Post post = new Post();
                        post.setPostOwner(null); // System post
                        post.setTitle("Work Anniversary");
                        post.setContent(profile.getUser().getFirst_name() + " " + profile.getUser().getLast_name() + " completes " + years + " years at the organization! 🏆");
                        post.setTags("anniversary");
                        post.setSystemGenerated(true);
                        post.setActive(true);
                        post.setVisibility_role(null); // All

                        postRepository.save(post);
                    }
                }
            }
        }
    }
}
