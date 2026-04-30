import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private contractService: ContractService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadContracts();
  }

  private loadContracts(): void {
    this.contractService.getAllContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching contracts:', err);
        this.errorMessage = 'Could not load contracts from the server.';
      }
    });
  }

  // NEW: Method to handle the booking action from the UI
  logBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);

    if (quantity > 0) {
      this.contractService.bookRoom(roomId, quantity).subscribe({
        next: () => {
          alert('Booking logged successfully! Inventory updated.');
          this.loadContracts(); // Reload to get fresh availableRooms count
        },
        error: (err) => {
          console.error('Booking failed', err);
          // Show the specific error message from the Spring Boot backend if available
          alert(err.error || 'Failed to log booking. Check inventory limits.');
        }
      });
    } else {
      alert('Please enter a valid quantity greater than 0.');
    }
  }

  releaseBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);

    if (quantity > 0) {
      this.contractService.releaseRoom(roomId, quantity).subscribe({
        next: () => {
          alert('Rooms released successfully! Inventory added back.');
          this.loadContracts(); // Reload to get fresh availableRooms count
        },
        error: (err) => {
          console.error('Release failed', err);
          alert(err.error || 'Failed to release rooms. Check contract limits.');
        }
      });
    } else {
      alert('Please enter a valid quantity greater than 0.');
    }
  }
}