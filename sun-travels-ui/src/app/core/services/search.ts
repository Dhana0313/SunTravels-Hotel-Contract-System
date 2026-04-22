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

  searchAvailableRooms(searchData: SearchRequest): Observable<SearchResult[]> {
    return this.http.post<SearchResult[]>(this.apiUrl, searchData);
  }
}