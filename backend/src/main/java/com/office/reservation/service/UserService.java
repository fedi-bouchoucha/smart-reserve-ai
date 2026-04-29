package com.office.reservation.service;

import com.office.reservation.dto.UserCreateRequest;
import com.office.reservation.dto.UserResponse;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public UserResponse findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(request.getRole() != null ? Role.valueOf(request.getRole()) : Role.EMPLOYEE)
                .build();

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            user.setManager(manager);
        }

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public List<UserResponse> getEmployeesByManager(Long managerId) {
        return userRepository.findByManagerId(managerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void archiveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setArchived(true);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserCreateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(Role.valueOf(request.getRole()));
        }
        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            user.setManager(manager);
        }

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateProfile(Long id, String fullName, String email, String profilePicture, String username) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setProfilePicture(profilePicture);
        if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(username);
        }
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse addEmployeeToManager(Long managerId, Long employeeId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        if (employee.getManager() != null) {
            throw new RuntimeException("Employee is already assigned to manager: " + employee.getManager().getFullName());
        }
        employee.setManager(manager);
        return mapToResponse(userRepository.save(employee));
    }

    @Transactional
    public void removeEmployeeFromManager(Long managerId, Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        if (employee.getManager() == null || !employee.getManager().getId().equals(managerId)) {
            throw new RuntimeException("This employee is not in your team");
        }
        employee.setManager(null);
        userRepository.save(employee);
    }

    public List<UserResponse> getUnassignedEmployees() {
        return userRepository.findByRoleAndManagerIsNull(Role.EMPLOYEE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void generateResetCode(String email) {
        if (email != null) email = email.trim();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String code = String.format("%06d", new Random().nextInt(1000000));
        user.setResetCode(code);
        user.setResetCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        notificationService.sendEmailNotification(user, "Password Reset Code", 
            "Your password reset code is: <b>" + code + "</b>. It will expire in 10 minutes.");
    }

    public boolean verifyResetCode(String email, String code) {
        if (email != null) email = email.trim();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getResetCode() != null && 
               user.getResetCode().equals(code) && 
               user.getResetCodeExpiresAt() != null && 
               user.getResetCodeExpiresAt().isAfter(LocalDateTime.now());
    }

    @Transactional
    public void resetPassword(String email, String newPassword, String code) {
        if (email != null) email = email.trim();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!verifyResetCode(email, code)) {
            throw new RuntimeException("Invalid or expired reset code");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetCodeExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole().name())
                .managerId(user.getManager() != null ? user.getManager().getId() : null)
                .managerName(user.getManager() != null ? user.getManager().getFullName() : null)
                .archived(Boolean.TRUE.equals(user.isArchived()))
                .targetAttendance(user.getTargetAttendance())
                .build();
    }
}
