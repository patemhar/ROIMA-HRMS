package com.roima.hrms.Config;

import com.roima.hrms.Exception.RateLimitException;
import com.roima.hrms.Utility.RateLimit;
import com.roima.hrms.Utility.RateLimitService;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final RateLimitService rateLimitService;
    private final SecurityUtil securityUtil;

    @Around("@annotation(com.roima.hrms.Utility.RateLimit)")
    public Object rateLimit(ProceedingJoinPoint joinPoint) throws Throwable {

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RateLimit rateLimit = method.getAnnotation(RateLimit.class);

        String key = getRateLimitKey(method);

        boolean allowed = rateLimitService.allowRequest(
            key,
            rateLimit.limit(),
            rateLimit.windowSeconds()
        );

        if (!allowed) {
            log.warn("Rate limit exceeded for key: {}", key);
            throw new RateLimitException(rateLimit.message());
        }

        return joinPoint.proceed();
    }

    private String getRateLimitKey(Method method) {
        String userId;
        try {
            userId = securityUtil.getCurrentUser().getId().toString();
        } catch (Exception e) {
            HttpServletRequest request = getCurrentRequest();
            userId = request != null ? getClientIP(request) : "anonymous";
        }

        String className = method.getDeclaringClass().getSimpleName();
        String methodName = method.getName();
        return String.format("%s:%s:%s", userId, className, methodName);
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}


