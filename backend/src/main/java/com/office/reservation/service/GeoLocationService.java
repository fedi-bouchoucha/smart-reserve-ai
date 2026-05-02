package com.office.reservation.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeoLocationService {

    private static final Logger logger = LoggerFactory.getLogger(GeoLocationService.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, String> locationCache = new ConcurrentHashMap<>();

    /**
     * Get location (Country/City) from IP address.
     * Uses ip-api.com (free version, HTTP only).
     */
    public String getLocation(String ip) {
        if (ip == null || ip.isEmpty() || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return "Local Workspace";
        }

        // Return from cache if available
        if (locationCache.containsKey(ip)) {
            return locationCache.get(ip);
        }

        try {
            // Using ip-api.com (free, no API key required for non-commercial)
            String url = "http://ip-api.com/json/" + ip;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "success".equals(response.get("status"))) {
                String country = (String) response.get("country");
                String city = (String) response.get("city");
                String location = country + "/" + city;
                
                locationCache.put(ip, location);
                return location;
            }
        } catch (Exception e) {
            logger.warn("Failed to resolve location for IP {}: {}", ip, e.getMessage());
        }

        return "Unknown Location";
    }
}
