package com.dhananjaya.suntravels.contract;

import com.dhananjaya.suntravels.hotel.Hotel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class ContractMapper {

    /**
     * Converts a ContractRequestDto into a Contract entity.
     * The Hotel entity must be fetched by the service layer and passed in.
     */
    public Contract toEntity(ContractRequestDto dto, Hotel hotel) {
        if (dto == null) {
            return null;
        }

        // 1. Build the base Contract without the room types first
        Contract contract = Contract.builder()
                .hotel(hotel)
                .validFrom(dto.validFrom())
                .validTo(dto.validTo())
                .markupPercentage(dto.markupPercentage())
                .roomTypes(new ArrayList<>()) // Initialize the list to avoid NullPointerExceptions
                .build();

        // 2. Map and attach the nested Room Types
        if (dto.roomTypes() != null) {
            dto.roomTypes().forEach(roomTypeDto -> {
                RoomType roomType = toRoomTypeEntity(roomTypeDto);
                // Use the utility method we created in the Entity to keep both sides of the relationship in sync
                contract.addRoomType(roomType);
            });
        }

        return contract;
    }

    /**
     * Helper method to map individual RoomTypeRequestDtos.
     * Kept private since it's only used internally by the Contract mapping process.
     */
    private RoomType toRoomTypeEntity(RoomTypeRequestDto dto) {
        if (dto == null) {
            return null;
        }

        return RoomType.builder()
                .typeName(dto.typeName())
                .price(dto.price())
                .noOfRooms(dto.noOfRooms())
                .maxAdults(dto.maxAdults())
                // We do not set the 'contract' field here; the contract.addRoomType() method handles it.
                .build();
    }
}
