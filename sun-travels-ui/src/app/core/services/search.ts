import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchRequest, SearchResult } from '../models/search';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private apiUrl = 'http://localhost:8080/api/search';

  constructor(private http: HttpClient) {}

  searchAvailableRooms(searchData: SearchRequest, page: number = 0, size: number = 10): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?page=${page}&size=${size}`, searchData);
  }
}