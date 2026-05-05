package com.dhananjaya.suntravels.contract;

import com.dhananjaya.suntravels.search.SearchResultProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {


    Page<Contract> findByHotelHotelNameContainingIgnoreCase(String hotelName, Pageable pageable);

    @Query(nativeQuery = true,
            value = """
                SELECT 
                    h.hotel_name AS hotelName, 
                    rt.type_name AS roomType, 
                    (rt.price * (1 + (c.markup_percentage / 100.0)) * :nights * :totalAdults) AS price,
                    'Available' AS availabilityStatus
                FROM room_types rt
                JOIN contracts c ON rt.contract_id = c.contract_id
                JOIN hotels h ON c.hotel_id = h.hotel_id
                WHERE c.valid_from <= :checkInDate 
                  AND c.valid_to >= :checkOutDate
                  AND rt.available_rooms >= :totalRoomsRequested
                  AND rt.max_adults >= :maxAdultsPerRoom
            """,
            countQuery = """
                SELECT count(rt.room_type_id) 
                FROM room_types rt
                JOIN contracts c ON rt.contract_id = c.contract_id
                WHERE c.valid_from <= :checkInDate 
                  AND c.valid_to >= :checkOutDate
                  AND rt.available_rooms >= :totalRoomsRequested
                  AND rt.max_adults >= :maxAdultsPerRoom
            """
    )
    Page<SearchResultProjection> findAvailableRoomsNative(
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate,
            @Param("nights") int nights,
            @Param("totalAdults") int totalAdults,
            @Param("totalRoomsRequested") int totalRoomsRequested,
            @Param("maxAdultsPerRoom") int maxAdultsPerRoom,
            Pageable pageable
    );
}