package com.office.reservation.repository;

import com.office.reservation.entity.ChangeRequest;
import com.office.reservation.entity.ChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {

    List<ChangeRequest> findByRequestedById(Long userId);

    // Find pending requests for a manager's employees
    @Query("SELECT cr FROM ChangeRequest cr WHERE cr.requestedBy.manager.id = :managerId AND cr.status = :status")
    List<ChangeRequest> findByManagerIdAndStatus(@Param("managerId") Long managerId, @Param("status") ChangeRequestStatus status);

    List<ChangeRequest> findByStatus(ChangeRequestStatus status);
}
