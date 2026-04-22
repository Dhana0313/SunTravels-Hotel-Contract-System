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
}
