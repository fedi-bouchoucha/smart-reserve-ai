package com.office.reservation.repository;

import com.office.reservation.entity.HomeOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HomeOfficeRepository extends JpaRepository<HomeOffice, Long> {
    
    List<HomeOffice> findByUserId(Long userId);
    
    List<HomeOffice> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
    
    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    Optional<HomeOffice> findByUserIdAndDate(Long userId, LocalDate date);
}
