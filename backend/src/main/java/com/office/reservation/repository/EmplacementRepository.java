package com.office.reservation.repository;

import com.office.reservation.entity.Emplacement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmplacementRepository extends JpaRepository<Emplacement, Long> {
}
