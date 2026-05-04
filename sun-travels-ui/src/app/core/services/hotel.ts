import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../models/hotel';

// NEW: Interface to match Spring Boot's Page object
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  
  // Points directly to your Spring Boot Hotel Controller
  private apiUrl = 'http://localhost:8080/api/hotels';

  constructor(private http: HttpClient) {}

  getAllHotels(page: number = 0, size: number = 10): Observable<PageResponse<Hotel>> {
    return this.http.get<PageResponse<Hotel>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel);
  }

  searchHotels(query: string): Observable<Hotel[]> {
    // Make sure this matches whatever endpoint you create in Spring Boot!
    return this.http.get<Hotel[]>(`${this.apiUrl}/search?name=${query}`);
  }
}