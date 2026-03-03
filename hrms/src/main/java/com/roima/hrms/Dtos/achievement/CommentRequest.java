package com.roima.hrms.dtos.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    @NotBlank(message = "Comment text is required")

    @Size(min = 1, max = 500, message = "Comment text must be between 1 and 500 characters")
    private String text;

}
