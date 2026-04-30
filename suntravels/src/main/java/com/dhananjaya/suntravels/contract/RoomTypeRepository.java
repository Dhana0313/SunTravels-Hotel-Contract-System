package com.dhananjaya.suntravels.contract;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing RoomType entities.
 * This is required to perform independent operations (like updating inventory)
 * on a single room type without needing to fetch and save the entire parent Contract.
 */
@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    // You don't even need to write any methods here!
    // JpaRepository gives you findById() and save() automatically.
}