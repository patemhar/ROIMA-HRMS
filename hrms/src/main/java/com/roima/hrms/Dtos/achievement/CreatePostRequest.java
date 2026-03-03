package com.roima.hrms.dtos.achievement;

import lombok.*;

import jakarta.validation.constraints.*;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 50, message = "Title must be between 1 and 50 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 1000, message = "Description must be between 1 and 1000 characters")
    private String description;

    @NotBlank(message = "Tags are required")
    @Size(min = 1, max = 200, message = "Tags must be between 1 and 200 characters")
    private String tags;

    private String visibility;
}
