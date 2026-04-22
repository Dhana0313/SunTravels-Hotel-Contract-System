export interface RoomTypeRequest {
  typeName: string;
  price: number;
  noOfRooms: number;
  maxAdults: number;
}

export interface ContractRequest {
  hotelId: number;
  validFrom: string; // We use string for dates to match the YYYY-MM-DD JSON format
  validTo: string;
  markupPercentage: number;
  roomTypes: RoomTypeRequest[];
}

export interface ContractResponse {
  id: number;
  hotel: {
    id: number;
    hotelName: string;
  };
  validFrom: string;
  validTo: string;
  markupPercentage: number;
  roomTypes: any[]; 
}