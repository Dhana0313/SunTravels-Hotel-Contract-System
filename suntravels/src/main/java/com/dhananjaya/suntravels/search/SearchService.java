package com.dhananjaya.suntravels.search;

import com.dhananjaya.suntravels.contract.Contract;
import com.dhananjaya.suntravels.contract.ContractRepository;
import com.dhananjaya.suntravels.contract.RoomType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ContractRepository contractRepository;

    @Transactional(readOnly = true)
    public List<SearchResultDto> searchAvailableRooms(SearchRequestDto request) {
        // 1. Calculate the actual check-out date
        LocalDate checkOutDate = request.checkInDate().plusDays(request.noOfNights());

        // 2. Fetch contracts valid for the entire stay using our custom repository query
        List<Contract> validContracts = contractRepository.findValidContractsForStay(request.checkInDate(), checkOutDate);

        List<SearchResultDto> searchResults = new ArrayList<>();

        // Calculate total rooms and total adults from the request
        int totalRoomsRequested = request.roomRequests().size();
        int totalAdultsRequested = request.roomRequests().stream()
                .mapToInt(RoomRequestDto::noOfAdults)
                .sum();

        // 3. Process each valid contract and its room types
        for (Contract contract : validContracts) {

            // Convert percentage to a multiplier (e.g., 15% becomes 1.15)
            BigDecimal markupMultiplier = contract.getMarkupPercentage()
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    .add(BigDecimal.ONE);

            for (RoomType roomType : contract.getRoomTypes()) {

                // --- AVAILABILITY LOGIC ---
                boolean isAvailable = true;

                // Check if the hotel has enough total rooms of this type
                if (roomType.getAvailableRooms() < totalRoomsRequested) {
                    isAvailable = false;
                } else {
                    // Check if this room type's 'max adults' can accommodate EACH requested room's capacity
                    for (RoomRequestDto roomReq : request.roomRequests()) {
                        if (roomReq.noOfAdults() > roomType.getMaxAdults()) {
                            isAvailable = false;
                            break;
                        }
                    }
                }

                String availabilityStatus = isAvailable ? "Available" : "Unavailable";

                // --- PRICING LOGIC ---
                // Formula: price * markup * number of nights * number of adults
                BigDecimal basePrice = roomType.getPrice();
                BigDecimal nights = BigDecimal.valueOf(request.noOfNights());
                BigDecimal adults = BigDecimal.valueOf(totalAdultsRequested);

                BigDecimal finalPrice = basePrice
                        .multiply(markupMultiplier)
                        .multiply(nights)
                        .multiply(adults)
                        .setScale(2, RoundingMode.HALF_UP);

                // Add the processed result to our list
                searchResults.add(new SearchResultDto(
                        contract.getHotel().getHotelName(),
                        roomType.getTypeName(),
                        finalPrice,
                        availabilityStatus
                ));
            }
        }

        return searchResults;
    }
}
