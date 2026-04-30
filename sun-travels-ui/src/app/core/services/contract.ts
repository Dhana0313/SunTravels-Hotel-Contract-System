import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getAllContracts(): Observable<ContractResponse[]> {
    return this.http.get<ContractResponse[]>(this.apiUrl);
  }

  // UPDATED: Corrected the URL to append to the base apiUrl
  bookRoom(roomId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/book?quantity=${quantity}`, {});
  }

  releaseRoom(roomId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/release?quantity=${quantity}`, {});
  }
}