package com.dhananjaya.suntravels.contract;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RoomTypeRequestDto(

        @NotBlank(message = "Room type name is required")
        String typeName,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,

        @NotNull(message = "Number of rooms is required")
        @Min(value = 1, message = "Number of rooms must be at least 1")
        Integer noOfRooms,

        @NotNull(message = "Max adults is required")
        @Min(value = 1, message = "Max adults must be at least 1")
        Integer maxAdults
) {}
