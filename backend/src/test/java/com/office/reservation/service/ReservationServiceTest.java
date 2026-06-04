package com.office.reservation.service;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;
import com.office.reservation.service.NotificationService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import java.util.function.Supplier;

class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private ChairRepository chairRepository;
    @Mock
    private MeetingRoomRepository meetingRoomRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DayOffRepository dayOffRepository;
    @Mock
    private HomeOfficeRepository homeOfficeRepository;
    @Mock
    private ConflictResolver conflictResolver;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private DistributedLockService lockService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReservationService reservationService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(lockService.acquireLock(anyString(), anyLong())).thenReturn(true);
        // Make executeWithLock actually invoke the supplier instead of returning null
        doAnswer(inv -> {
            Supplier<?> supplier = inv.getArgument(3);
            return supplier.get();
        }).when(lockService).executeWithLock(anyString(), anyLong(), anyLong(), any());
    }

    @Test
    void testCreateReservation_Employee63_Success() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("employee63");
        user.setRole(Role.EMPLOYEE);
        user.setTargetAttendance(50);

        Chair chair = new Chair();
        chair.setId(1L);
        chair.setNumber(1);
        Emplacement emp = new Emplacement();
        emp.setName("1");
        chair.setEmplacement(emp);

        ReservationRequest request = new ReservationRequest();
        request.setChairId(1L);
        request.setDate(LocalDate.now().plusMonths(1).withDayOfMonth(10)); // Next month, 10th

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(chairRepository.findById(1L)).thenReturn(Optional.of(chair));
        when(chairRepository.findByIdWithLock(1L)).thenReturn(Optional.of(chair));
        when(reservationRepository.existsDeskReservationForUserAndDate(any(), any())).thenReturn(false);
        when(dayOffRepository.existsByUserIdAndDateAndStatus(any(), any(), any())).thenReturn(false);
        when(homeOfficeRepository.existsByUserIdAndDate(any(), any())).thenReturn(false);
        when(reservationRepository.existsOverlappingChairReservation(any(), any(), any(), any())).thenReturn(false);
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        doNothing().when(eventPublisher).publishEvent(any());

        // Act
        ReservationResponse response = reservationService.createReservation(1L, request);

        // Assert
        assertNotNull(response);
        assertEquals("CONFIRMED", response.getStatus());
        verify(reservationRepository).save(any());
    }

    @Test
    void testCreateReservation_Employee63_WrongDesk_Failure() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("employee63");
        user.setRole(Role.EMPLOYEE);

        Chair chair = new Chair();
        chair.setId(2L);
        Emplacement emp = new Emplacement();
        emp.setName("2");
        chair.setEmplacement(emp);

        ReservationRequest request = new ReservationRequest();
        request.setChairId(2L);
        request.setDate(LocalDate.now().plusMonths(1).withDayOfMonth(10));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(chairRepository.findById(2L)).thenReturn(Optional.of(chair));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reservationService.createReservation(1L, request);
        });

        assertEquals("employee63 can only reserve Desk 1.", exception.getMessage());
    }

    @Test
    void testCreateReservation_Weekend_Failure() {
        // Arrange
        User user = new User();
        user.setRole(Role.EMPLOYEE);
        
        ReservationRequest request = new ReservationRequest();
        request.setDate(LocalDate.now().plusMonths(1).with(java.time.temporal.TemporalAdjusters.next(java.time.DayOfWeek.SATURDAY)));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reservationService.createReservation(1L, request);
        });

        assertEquals("Cannot reserve on weekends.", exception.getMessage());
    }
}
