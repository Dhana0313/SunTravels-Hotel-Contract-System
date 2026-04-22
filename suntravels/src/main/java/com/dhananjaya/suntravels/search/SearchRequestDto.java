package com.dhananjaya.suntravels.search;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record SearchRequestDto(

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in date cannot be in the past")
        LocalDate checkInDate,

        @NotNull(message = "Number of nights is required")
        @Min(value = 1, message = "Number of nights must be at least 1")
        Integer noOfNights,

        @NotEmpty(message = "At least one room request is required")
        @Valid // Ensures the validation inside RoomRequestDto is also triggered
        List<RoomRequestDto> roomRequests
) {}
