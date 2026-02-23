package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.achievement.PostDto;

import java.util.List;

public interface AchievementService {

    List<PostDto> getAchievementFeed();

    void generateBirthdayPosts();

    void generateAnniversaryPosts();
}
