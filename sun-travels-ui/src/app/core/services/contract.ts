import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractRequest, ContractResponse } from '../models/contract';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  // Base URL pointing to the Contract Controller
  private apiUrl = 'http://localhost:8080/api/contracts';

  constructor(private http: HttpClient) { }

  saveContract(contractData: ContractRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, contractData);
  }

  getAllContracts(page: number = 0, size: number = 3, searchQuery: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  // UPDATED: Corrected the URL to append to the base apiUrl
  bookRoom(roomId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/book?quantity=${quantity}`, {});
  }

  releaseRoom(roomId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/release?quantity=${quantity}`, {});
  }
}