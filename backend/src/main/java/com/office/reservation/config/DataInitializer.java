package com.office.reservation.config;

import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmplacementRepository emplacementRepository;
    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
            EmplacementRepository emplacementRepository,
            ChairRepository chairRepository,
            MeetingRoomRepository meetingRoomRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emplacementRepository = emplacementRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeWorkspace();
        initializeRooms();
    }

    private void initializeUsers() {
        // Create Admin
        if (!userRepository.findByUsername("admin").isPresent()) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Admin")
                    .email("admin@office.com")
                    .role(Role.ADMIN)
                    .build());
        }

        // Update existing Employees with attendance targets
        List<String> pct20 = List.of("ITE00000012", "ITE00000016", "ITE00000022", "ITE00000026", "ITE00000029", "ITE00000030", "ITE00000031", "ITE00000036", "ITE00000037", "ITE00000040", "ITE00000043", "ITE00000045", "ITE00000046", "ITE00000054", "ITE00000060");
        List<String> pct100 = List.of("ITE00000063", "ITE00000070", "ITE00000071");

        userRepository.findAll().forEach(u -> {
            if (u.getUsername().startsWith("employee")) {
                String iteId = u.getFullName(); // The full_name contains the ITE ID
                int target = 50;
                if (pct20.contains(iteId)) target = 20;
                else if (pct100.contains(iteId)) target = 100;
                u.setTargetAttendance(target);
                userRepository.save(u);
            }
        });

        // Create Managers
        User manager1 = userRepository.findByUsername("manager1").orElse(null);
        if (manager1 == null) {
            manager1 = userRepository.save(User.builder()
                    .username("manager1")
                    .password(passwordEncoder.encode("manager123"))
                    .fullName("Alice Martin")
                    .email("alice.martin@office.com")
                    .role(Role.MANAGER)
                    .build());
        } else if (manager1.getEmail() == null) {
            manager1.setEmail("alice.martin@office.com");
            userRepository.save(manager1);
        }

        User manager2 = userRepository.findByUsername("manager2").orElse(null);
        if (manager2 == null) {
            manager2 = userRepository.save(User.builder()
                    .username("manager2")
                    .password(passwordEncoder.encode("manager123"))
                    .fullName("Bob Johnson")
                    .email("bob.johnson@office.com")
                    .role(Role.MANAGER)
                    .build());
        } else if (manager2.getEmail() == null) {
            manager2.setEmail("bob.johnson@office.com");
            userRepository.save(manager2);
        }
    }

    private void initializeWorkspace() {
        // Ensure exactly 44 emplacements numbered 1 to 44
        for (int i = 1; i <= 44; i++) {
            String name = String.valueOf(i);
            int floor = 3; // The user wants only one floor named floor 3

            Emplacement existingEmp = emplacementRepository.findByName(name).orElse(null);
            if (existingEmp != null) {
                if (existingEmp.getFloor() == null || existingEmp.getFloor() != floor) {
                    existingEmp.setFloor(floor);
                    emplacementRepository.save(existingEmp);
                }
                continue;
            }

            Emplacement emp = emplacementRepository.save(Emplacement.builder()
                    .name(name)
                    .floor(floor)
                    .build());

            chairRepository.save(Chair.builder()
                    .number(1)
                    .emplacement(emp)
                    .build());
        }
        
        System.out.println("=== Workspace Initialization Sync (44 Desks on Floor 3) ===");
    }

    private void initializeRooms() {
        if (meetingRoomRepository.count() > 0) {
            // Update existing rooms to floor 3
            meetingRoomRepository.findAll().forEach(room -> {
                if (room.getFloor() == null || room.getFloor() != 3) {
                    room.setFloor(3);
                    meetingRoomRepository.save(room);
                }
            });
            return;
        }

        meetingRoomRepository.save(MeetingRoom.builder()
                .name("Meeting Room")
                .capacity(10)
                .floor(3)
                .build());

        System.out.println("=== Room Initialized (Meeting Room on Floor 3) ===");
    }
}
