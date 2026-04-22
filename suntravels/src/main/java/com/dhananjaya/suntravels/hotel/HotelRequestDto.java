package com.dhananjaya.suntravels.hotel;

import jakarta.validation.constraints.NotBlank;

public record HotelRequestDto(
        @NotBlank(message = "Hotel name is required")
        String hotelName
) {}
