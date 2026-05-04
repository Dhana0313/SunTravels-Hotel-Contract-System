package com.dhananjaya.suntravels.contract;

import com.dhananjaya.suntravels.common.exception.ResourceNotFoundException;
import com.dhananjaya.suntravels.hotel.Hotel;
import com.dhananjaya.suntravels.hotel.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final HotelRepository hotelRepository;
    private final ContractMapper contractMapper;

    // 1. INJECT YOUR NEW REPOSITORY HERE
    private final RoomTypeRepository roomTypeRepository;

    @Transactional
    public Contract createContract(ContractRequestDto requestDto) {
        Hotel hotel = hotelRepository.findById(requestDto.hotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + requestDto.hotelId()));

        Contract contract = contractMapper.toEntity(requestDto, hotel);

        // 2. CRITICAL UPDATE: Set the initial available inventory for every room
        if (contract.getRoomTypes() != null) {
            for (RoomType room : contract.getRoomTypes()) {
                room.setContract(contract);
                room.setAvailableRooms(room.getNoOfRooms()); // Initialize live inventory
            }
        }

        return contractRepository.save(contract);
    }

    @Transactional(readOnly = true)
    public Page<Contract> getAllContracts(int page, int size) {
        // Create a Pageable object, sorting by ID descending so newest contracts are on page 0
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // JpaRepository automatically understands the Pageable parameter!
        return contractRepository.findAll(pageable);
    }

    // 3. THE NEW METHOD TO HANDLE INVENTORY DECREASES
    @Transactional
    public RoomType logBooking(Long roomId, Integer quantity) {
        // We can now find the specific room directly without fetching the whole contract
        RoomType room = roomTypeRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        // Validation to prevent negative inventory
        if (room.getAvailableRooms() < quantity) {
            throw new IllegalArgumentException("Not enough available rooms! Current inventory: " + room.getAvailableRooms());
        }

        // Subtract the booked rooms and save just this specific room
        room.setAvailableRooms(room.getAvailableRooms() - quantity);
        return roomTypeRepository.save(room);
    }


    @Transactional
    public RoomType releaseBooking(Long roomId, Integer quantity) {
        RoomType room = roomTypeRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        // CRITICAL VALIDATION: Cannot exceed original contracted capacity
        if (room.getAvailableRooms() + quantity > room.getNoOfRooms()) {
            throw new IllegalArgumentException("Cannot release more rooms than the total contracted amount! Max limit: " + room.getNoOfRooms());
        }

        // Add the freed rooms back to inventory
        room.setAvailableRooms(room.getAvailableRooms() + quantity);
        return roomTypeRepository.save(room);
    }
}