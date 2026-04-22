package com.dhananjaya.suntravels.contract;

import com.dhananjaya.suntravels.hotel.Hotel;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long id;

    // FetchType.LAZY is a performance best practice so we don't
    // fetch the Hotel data from the DB unless we explicitly ask for it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;

    @Column(name = "markup_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal markupPercentage;

    // CascadeType.ALL ensures that when we save a Contract, its RoomTypes are saved automatically.
    // orphanRemoval = true ensures if we remove a room type from this list, it's deleted from the DB.
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoomType> roomTypes = new ArrayList<>();

    // Utility method to keep both sides of the bidirectional relationship in sync
    public void addRoomType(RoomType roomType) {
        roomTypes.add(roomType);
        roomType.setContract(this);
    }
}
