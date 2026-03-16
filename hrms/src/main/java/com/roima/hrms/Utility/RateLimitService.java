package com.roima.hrms.Utility;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    public boolean allowRequest(String key, int limit, int windowSeconds) {

        RateLimitBucket bucket = buckets.computeIfAbsent(
            key,
            k -> new RateLimitBucket(limit, windowSeconds)
        );

        if (bucket.getLimit() != limit || bucket.getWindowSeconds() != windowSeconds) {
            bucket = new RateLimitBucket(limit, windowSeconds);
            buckets.put(key, bucket);
        }

        return bucket.tryConsume();
    }


    public RateLimitBucket getBucket(String key) {
        return buckets.get(key);
    }

    public void clearRateLimit(String key) {
        buckets.remove(key);
    }

    public void clearAllRateLimits() {
        buckets.clear();
    }
}

