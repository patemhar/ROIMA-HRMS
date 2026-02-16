package com.roima.hrms.Dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DocUploadResponse {

    List<String> uploadedDocs = new ArrayList<>();

    List<String> failedDocs = new ArrayList<>();

    List<String> errors = new ArrayList<>();
}
