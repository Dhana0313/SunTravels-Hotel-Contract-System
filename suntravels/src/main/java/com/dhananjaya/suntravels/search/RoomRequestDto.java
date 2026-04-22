package com.dhananjaya.suntravels.search;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RoomRequestDto(
        @NotNull(message = "Number of adults is required")
        @Min(value = 1, message = "At least 1 adult is required per room")
        Integer noOfAdults
) {}
