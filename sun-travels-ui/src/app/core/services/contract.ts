import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractRequest, ContractResponse } from '../models/contract';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private apiUrl = 'http://localhost:8080/api/contracts';

  constructor(private http: HttpClient) {}

  saveContract(contractData: ContractRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, contractData);
  }

  getAllContracts(): Observable<ContractResponse[]> {
    return this.http.get<ContractResponse[]>(this.apiUrl);
  }
}