package com.office.reservation.repository;

import com.office.reservation.entity.Emplacement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmplacementRepository extends JpaRepository<Emplacement, Long> {
    Optional<Emplacement> findByName(String name);
}
