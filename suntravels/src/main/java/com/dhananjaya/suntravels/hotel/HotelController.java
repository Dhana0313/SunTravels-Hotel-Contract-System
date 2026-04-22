package com.dhananjaya.suntravels.hotel;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class HotelController {

    private final HotelService hotelService;

    /**
     * POST endpoint to add a new hotel.
     */
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@Valid @RequestBody HotelRequestDto requestDto) {
        Hotel createdHotel = hotelService.createHotel(requestDto);
        return new ResponseEntity<>(createdHotel, HttpStatus.CREATED);
    }

    /**
     * GET endpoint to fetch the list of available hotels.
     */
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        List<Hotel> hotels = hotelService.getAllHotels();
        return ResponseEntity.ok(hotels);
    }
}
