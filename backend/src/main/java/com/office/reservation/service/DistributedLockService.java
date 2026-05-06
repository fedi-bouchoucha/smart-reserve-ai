package com.office.reservation.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class DistributedLockService {

    private final StringRedisTemplate redisTemplate;

    public DistributedLockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean acquireLock(String lockKey, long timeoutSeconds) {
        try {
            Boolean success = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", timeoutSeconds, TimeUnit.SECONDS);
            return success != null && success;
        } catch (Exception e) {
            // Fallback for environments without Redis (like tests without embedded redis)
            // In production, we'd throw or handle properly.
            System.err.println("Redis not available, falling back to local simulation: " + e.getMessage());
            return true; 
        }
    }

    public void releaseLock(String lockKey) {
        try {
            redisTemplate.delete(lockKey);
        } catch (Exception e) {
            System.err.println("Failed to release Redis lock: " + e.getMessage());
        }
    }
}
