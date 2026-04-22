package com.dhananjaya.suntravels.contract;

import com.dhananjaya.suntravels.common.exception.ResourceNotFoundException;
import com.dhananjaya.suntravels.hotel.Hotel;
import com.dhananjaya.suntravels.hotel.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final HotelRepository hotelRepository;
    private final ContractMapper contractMapper;

    /**
     * Loads a new contract into the system along with its defined markups and room types.
     * * @param requestDto The DTO containing the contract details from the UI.
     * @return The saved Contract entity.
     */
    @Transactional
    public Contract createContract(ContractRequestDto requestDto) {
        // 1. Verify the hotel exists before attempting to create a contract for it
        Hotel hotel = hotelRepository.findById(requestDto.hotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + requestDto.hotelId()));

        // 2. Map the DTO to an Entity, passing the fetched Hotel
        Contract contract = contractMapper.toEntity(requestDto, hotel);

        // 3. Save the contract (Hibernate will cascade and save the RoomTypes automatically)
        return contractRepository.save(contract);
    }

    /**
     * Retrieves all contracts from the system to be viewed in the UI.
     * * @return A list of all Contract entities.
     */
    @Transactional(readOnly = true)
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
}
