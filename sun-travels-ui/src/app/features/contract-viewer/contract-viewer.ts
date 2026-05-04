import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../core/services/contract';
import { ContractResponse } from '../../core/models/contract';

// 1. IMPORT SWEETALERT
import Swal from 'sweetalert2';

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

  isLoading = true;

  // NEW: Pagination State Variables
  currentPage = 0;
  pageSize = 3;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private contractService: ContractService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadContracts();
  }

  private loadContracts(): void {
    this.isLoading = true;

    this.contractService.getAllContracts(this.currentPage, this.pageSize).subscribe({
      next: (data: any) => {
        // Spring Boot wraps the array inside 'content'
        this.contracts = data.content;

        // Save the pagination metadata
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.currentPage = data.number; // Spring Boot returns the current page as 'number'

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching contracts:', err);
        this.errorMessage = 'Could not load contracts from the server.';
        this.isLoading = false;
        this.cdr.detectChanges();

        Swal.fire({
          title: 'Connection Error',
          text: 'Could not load contracts from the server. Please check your connection.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // NEW: Pagination Navigation Methods
  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadContracts();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadContracts();
    }
  }

  // Method to handle the booking action from the UI
  logBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);

    if (quantity > 0) {
      this.contractService.bookRoom(roomId, quantity).subscribe({
        next: () => {
          // REPLACED: Success Toast
          Swal.fire({
            title: 'Booked!',
            text: 'Booking logged successfully! Inventory updated.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadContracts(); // Reload to get fresh availableRooms count
        },
        error: (err) => {
          console.error('Booking failed', err);
          // REPLACED: Error Alert
          Swal.fire({
            title: 'Booking Failed',
            text: err.error || 'Failed to log booking. Check inventory limits.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      // REPLACED: Validation Warning
      Swal.fire('Invalid Input', 'Please enter a valid quantity greater than 0.', 'warning');
    }
  }

  releaseBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);

    if (quantity > 0) {
      this.contractService.releaseRoom(roomId, quantity).subscribe({
        next: () => {
          // REPLACED: Success Toast
          Swal.fire({
            title: 'Released!',
            text: 'Rooms released successfully! Inventory added back.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadContracts(); // Reload to get fresh availableRooms count
        },
        error: (err) => {
          console.error('Release failed', err);
          // REPLACED: Error Alert
          Swal.fire({
            title: 'Release Failed',
            text: err.error || 'Failed to release rooms. Check contract limits.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      // REPLACED: Validation Warning
      Swal.fire('Invalid Input', 'Please enter a valid quantity greater than 0.', 'warning');
    }
  }

  isExpired(validToDate: string): boolean {
    const today = new Date();
    // Reset time to midnight so it only compares the date
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(validToDate);

    return expirationDate < today;
  }
}