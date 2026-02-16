package com.roima.hrms.Exception;

import org.apache.coyote.BadRequestException;

public class RoleNotFoundException extends IllegalArgumentException {
    public RoleNotFoundException(String message) {
        super(message);
    }
}
