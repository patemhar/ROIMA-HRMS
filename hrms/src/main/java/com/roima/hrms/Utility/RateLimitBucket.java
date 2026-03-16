package com.roima.hrms.Utility;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

@Data
@AllArgsConstructor
public class RateLimitBucket {
    private Instant windowStart;
    private AtomicInteger requestCount;
    private int limit;
    private int windowSeconds;

    public RateLimitBucket(int limit, int windowSeconds) {
        this.windowStart = Instant.now();
        this.requestCount = new AtomicInteger(0);
        this.limit = limit;
        this.windowSeconds = windowSeconds;
    }

    public boolean tryConsume() {

        Instant now = Instant.now();

        if (now.isAfter(windowStart.plusSeconds(windowSeconds))) {
            windowStart = now;
            requestCount.set(0);
        }

        int current = requestCount.incrementAndGet();
        return current <= limit;
    }

    public long getResetTime() {
        return windowStart.plusSeconds(windowSeconds).getEpochSecond();
    }

    public int getRemainingRequests() {
        return Math.max(0, limit - requestCount.get());
    }
}

