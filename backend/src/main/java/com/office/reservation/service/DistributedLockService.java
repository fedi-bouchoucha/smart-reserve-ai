package com.office.reservation.service;

import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
public class DistributedLockService {

    private final RedissonClient redissonClient;

    public DistributedLockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    /**
     * Executes a task within a distributed lock.
     * 
     * @param lockKey The key for the lock
     * @param waitTimeSeconds Maximum time to wait for the lock
     * @param leaseTimeSeconds Time after which the lock is automatically released
     * @param task The task to execute
     * @return The result of the task
     */
    public <T> T executeWithLock(String lockKey, long waitTimeSeconds, long leaseTimeSeconds, Supplier<T> task) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean acquired = lock.tryLock(waitTimeSeconds, leaseTimeSeconds, TimeUnit.SECONDS);
            if (!acquired) {
                throw new RuntimeException("Could not acquire lock for key: " + lockKey + ". Resource is busy.");
            }
            return task.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while waiting for lock: " + lockKey, e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    /**
     * Legacy support for existing manual locking. 
     * NOTE: It's better to use executeWithLock to ensure release.
     */
    public boolean acquireLock(String lockKey, long timeoutSeconds) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            return lock.tryLock(0, timeoutSeconds, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    public void releaseLock(String lockKey) {
        RLock lock = redissonClient.getLock(lockKey);
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
