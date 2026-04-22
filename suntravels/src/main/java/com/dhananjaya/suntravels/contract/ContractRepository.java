package com.dhananjaya.suntravels.contract;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    /**
     * Finds all contracts where the requested stay (check-in to check-out)
     * falls entirely within the contract's validity period.
     * * We use JOIN FETCH to load the associated Hotel and RoomTypes in a single query,
     * which prevents the N+1 performance problem during search calculations.
     */
    @Query("SELECT DISTINCT c FROM Contract c " +
            "JOIN FETCH c.hotel " +
            "JOIN FETCH c.roomTypes " +
            "WHERE c.validFrom <= :checkInDate " +
            "AND c.validTo >= :checkOutDate")
    List<Contract> findValidContractsForStay(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );
}
