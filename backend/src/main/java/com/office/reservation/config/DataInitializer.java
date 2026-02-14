package com.office.reservation.config;

import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
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
        if (userRepository.count() > 0)
            return;

        // Create Admin
        User admin = userRepository.save(User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Admin")
                .email("admin@office.com")
                .role(Role.ADMIN)
                .build());

        // Create Managers
        User manager1 = userRepository.save(User.builder()
                .username("manager1")
                .password(passwordEncoder.encode("manager123"))
                .fullName("Alice Martin")
                .email("alice.martin@office.com")
                .role(Role.MANAGER)
                .build());

        User manager2 = userRepository.save(User.builder()
                .username("manager2")
                .password(passwordEncoder.encode("manager123"))
                .fullName("Bob Johnson")
                .email("bob.johnson@office.com")
                .role(Role.MANAGER)
                .build());

        // Create Employees
        String[] firstNames = { "Charlie", "Diana", "Edward", "Fiona", "George",
                "Hannah", "Ivan", "Julia", "Kevin", "Laura" };
        String[] lastNames = { "Brown", "Davis", "Wilson", "Taylor", "Anderson",
                "Thomas", "Moore", "Clark", "Rodriguez", "Lewis" };

        for (int i = 0; i < 10; i++) {
            User manager = (i < 5) ? manager1 : manager2;
            userRepository.save(User.builder()
                    .username("employee" + (i + 1))
                    .password(passwordEncoder.encode("emp123"))
                    .fullName(firstNames[i] + " " + lastNames[i])
                    .email(firstNames[i].toLowerCase() + "." + lastNames[i].toLowerCase() + "@office.com")
                    .role(Role.EMPLOYEE)
                    .manager(manager)
                    .build());
        }

        // Create 80 emplacements with 4 chairs each
        for (int i = 1; i <= 80; i++) {
            int floor = (i - 1) / 20 + 1; // Floors 1-4, 20 emplacements each
            Emplacement emp = emplacementRepository.save(Emplacement.builder()
                    .name("E" + String.format("%02d", i))
                    .floor(floor)
                    .build());

            for (int c = 1; c <= 4; c++) {
                chairRepository.save(Chair.builder()
                        .number(c)
                        .emplacement(emp)
                        .build());
            }
        }

        // Create Meeting Rooms
        String[] roomNames = { "Salle Conférence A", "Salle Conférence B", "Salle Réunion 1",
                "Salle Réunion 2", "Salle Brainstorm", "Salle Direction" };
        int[] capacities = { 20, 20, 10, 10, 8, 6 };
        int[] floors = { 1, 2, 1, 2, 3, 4 };

        for (int i = 0; i < roomNames.length; i++) {
            meetingRoomRepository.save(MeetingRoom.builder()
                    .name(roomNames[i])
                    .capacity(capacities[i])
                    .floor(floors[i])
                    .build());
        }

        System.out.println("=== Data Initialized ===");
        System.out.println("Admin: admin / admin123");
        System.out.println("Manager: manager1 / manager123, manager2 / manager123");
        System.out.println("Employees: employee1-10 / emp123");
        System.out.println("80 Emplacements, 320 Chairs, 6 Meeting Rooms");
    }
}
