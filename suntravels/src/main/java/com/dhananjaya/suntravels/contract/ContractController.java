package com.dhananjaya.suntravels.contract;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ContractController {

    private final ContractService contractService;

    /**
     * POST endpoint to load a new paper contract into the system.
     * The @Valid annotation ensures our DTO constraints are checked before hitting the service.
     */
    @PostMapping
    public ResponseEntity<Contract> createContract(@Valid @RequestBody ContractRequestDto requestDto) {
        Contract createdContract = contractService.createContract(requestDto);
        return new ResponseEntity<>(createdContract, HttpStatus.CREATED);
    }

    /**
     * GET endpoint to view all loaded contracts.
     */
    @GetMapping
    public ResponseEntity<List<Contract>> getAllContracts() {
        List<Contract> contracts = contractService.getAllContracts();
        return ResponseEntity.ok(contracts);
    }

    /**
     * PATCH endpoint to decrease the available inventory when a room is booked.
     * Uses PATCH because we are modifying a specific field on an existing resource, not replacing it.
     */
    @PatchMapping("/rooms/{roomId}/book")
    public ResponseEntity<?> decreaseInventory(
            @PathVariable Long roomId,
            @RequestParam Integer quantity) {
        try {
            RoomType updatedRoom = contractService.logBooking(roomId, quantity);
            return ResponseEntity.ok(updatedRoom);
        } catch (IllegalArgumentException e) {
            // Catches the error if they try to book more rooms than are available
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PATCH endpoint to increase the available inventory when rooms become free.
     */
    @PatchMapping("/rooms/{roomId}/release")
    public ResponseEntity<?> releaseInventory(
            @PathVariable Long roomId,
            @RequestParam Integer quantity) {
        try {
            RoomType updatedRoom = contractService.releaseBooking(roomId, quantity);
            return ResponseEntity.ok(updatedRoom);
        } catch (IllegalArgumentException e) {
            // Catches the error if they try to exceed the original contract limit
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}