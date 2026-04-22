package com.dhananjaya.suntravels.search;

import java.math.BigDecimal;

public record SearchResultDto(
        String hotelName, // [cite: 27]
        String roomType, // [cite: 28]
        BigDecimal price, // [cite: 29]
        String availabilityStatus // [cite: 30]
) {}
