package com.dhananjaya.suntravels.search;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SearchController {

    private final SearchService searchService;

    /**
     * POST endpoint to search for available rooms and calculate pricing.
     * We use POST instead of GET here because the search criteria contains a nested
     * list of room requests, which is much cleaner to send in a JSON request body
     * than as complex URL query parameters.
     */
    @PostMapping
    public ResponseEntity<List<SearchResultDto>> searchRooms(@Valid @RequestBody SearchRequestDto requestDto) {
        List<SearchResultDto> results = searchService.searchAvailableRooms(requestDto);
        return ResponseEntity.ok(results);
    }
}
