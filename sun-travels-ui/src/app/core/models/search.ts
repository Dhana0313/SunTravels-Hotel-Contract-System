export interface RoomRequest {
  noOfAdults: number;
}

export interface SearchRequest {
  checkInDate: string; // YYYY-MM-DD
  noOfNights: number;
  roomRequests: RoomRequest[];
}

export interface SearchResult {
  hotelName: string;
  roomType: string;
  price: number;
  availabilityStatus: string;
}