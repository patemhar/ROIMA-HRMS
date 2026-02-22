package com.roima.hrms.Dtos.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    private String title;
    private String description;
    private String tags;
    private String visibility; // or UUID roleId
}
