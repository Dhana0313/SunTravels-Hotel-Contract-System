package com.dhananjaya.suntravels.hotel;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    /**
     * Creates a new Hotel in the system.
     */
    @Transactional
    public Hotel createHotel(HotelRequestDto requestDto) {
        Hotel hotel = Hotel.builder()
                .hotelName(requestDto.hotelName())
                .build();

        return hotelRepository.save(hotel);
    }

    /**
     * Retrieves all hotels.
     */
    @Transactional(readOnly = true)
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
}
