package com.roima.hrms.Shared.Dtos.Travel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class ExpenseDocRequest {

    private List<MultipartFile> expense_docs;

}