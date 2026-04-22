package com.dhananjaya.suntravels.contract;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ContractRequestDto(

        @NotNull(message = "Hotel ID is required")
        Long hotelId,

        @NotNull(message = "Valid from date is required")
        LocalDate validFrom,

        @NotNull(message = "Valid to date is required")
        LocalDate validTo,

        @NotNull(message = "Markup percentage is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Markup cannot be negative")
        BigDecimal markupPercentage,

        @NotEmpty(message = "At least one room type must be added to the contract")
        List<RoomTypeRequestDto> roomTypes
) {}
