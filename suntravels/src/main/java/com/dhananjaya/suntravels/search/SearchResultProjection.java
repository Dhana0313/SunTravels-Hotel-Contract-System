package com.dhananjaya.suntravels.search;

import java.math.BigDecimal;

public interface SearchResultProjection {
    String getHotelName();
    String getRoomType();
    BigDecimal getPrice();
    String getAvailabilityStatus();
}