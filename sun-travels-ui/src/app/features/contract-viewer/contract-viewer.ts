import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../core/services/contract';
import { ContractResponse } from '../../core/models/contract';

@Component({
  selector: 'app-contract-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-viewer.html',
  styleUrls: ['./contract-viewer.scss']
})
export class ContractViewer implements OnInit {
  contracts: ContractResponse[] = [];
  errorMessage = '';

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  private loadContracts(): void {
    this.contractService.getAllContracts().subscribe({
      next: (data) => {
        this.contracts = data;
      },
      error: (err) => {
        console.error('Error fetching contracts:', err);
        this.errorMessage = 'Could not load contracts from the server.';
      }
    });
  }
}