package com.roima.hrms.Dtos.Util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class userOptions {
    private UUID userId;
    private String name;
}
