package com.dhananjaya.suntravels.search;

import com.dhananjaya.suntravels.contract.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Description;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ContractRepository contractRepository;

    public record AiSearchRequest(String checkInDate, int noOfNights, int totalAdults, int totalRooms) {}
    @Transactional(readOnly = true)
    public Page<SearchResultDto> searchAvailableRooms(SearchRequestDto request, int page, int size) {

        // 1. Calculate dates and requirements
        LocalDate checkOutDate = request.checkInDate().plusDays(request.noOfNights());


        int totalRoomsRequested = request.roomRequests().size();

        int totalAdultsRequested = request.roomRequests().stream()
                .mapToInt(RoomRequestDto::noOfAdults)
                .sum();

        // Find the maximum adults required in any single room from the request
        int maxAdultsPerRoom = request.roomRequests().stream()
                .mapToInt(RoomRequestDto::noOfAdults)
                .max().orElse(1);

        // 2. Setup standard Spring Pagination
        Pageable pageable = PageRequest.of(page, size);

        // 3. Let the Database do all the heavy lifting
        Page<SearchResultProjection> projectionPage = contractRepository.findAvailableRoomsNative(
                request.checkInDate(),
                checkOutDate,
                request.noOfNights(),
                totalAdultsRequested,
                totalRoomsRequested,
                maxAdultsPerRoom,
                pageable
        );

        // 4. Map the Projection back to your original DTO (and set scale to 2 decimal places)
        return projectionPage.map(p -> new SearchResultDto(
                p.getHotelName(),
                p.getRoomType(),
                p.getPrice().setScale(2, RoundingMode.HALF_UP),
                p.getAvailabilityStatus()
        ));
    }

    @Tool(description = "Searches the Sun Travels database for available hotel rooms based on check-in date (YYYY-MM-DD), nights, adults, and rooms.")
    public String searchHotelContracts(AiSearchRequest request) {
        try {
            LocalDate checkIn = LocalDate.parse(request.checkInDate());

            // Build the DTO compatible with your native query
            SearchRequestDto nativeRequest = new SearchRequestDto(
                    checkIn,
                    request.noOfNights(),
                    List.of(new RoomRequestDto(request.totalAdults()))
            );

            // Call your existing method
            Page<SearchResultDto> results = searchAvailableRooms(nativeRequest, 0, 5);

            if (results.isEmpty()) {
                return "No available rooms found for those dates.";
            }

            // Format results for the AI
            StringBuilder sb = new StringBuilder("Available Options:\n");
            for (SearchResultDto dto : results.getContent()) {
                sb.append("- ").append(dto.hotelName())
                        .append(", Room: ").append(dto.roomType())
                        .append(", Price: $").append(dto.price())
                        .append(" (").append(dto.availabilityStatus()).append(")\n");
            }
            return sb.toString();

        } catch (Exception e) {
            return "Error searching database: " + e.getMessage();
        }
    }
}