import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../core/services/contract';
import { ContractResponse } from '../../core/models/contract';
import Swal from 'sweetalert2';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-contract-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-viewer.html',
  styleUrls: ['./contract-viewer.scss']
})
export class ContractViewer implements OnInit, OnDestroy {
  contracts: ContractResponse[] = [];
  errorMessage = '';
  isLoading = true;

  currentPage = 0;
  pageSize = 3;
  totalPages = 0;
  totalElements = 0;

  // NEW: Search state variables
  currentSearchQuery = '';
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private contractService: ContractService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.setupSearchListener();
    this.loadContracts();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // NEW: RxJS pipeline to debounce search input
  private setupSearchListener(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.currentSearchQuery = query;
      this.currentPage = 0; // Reset to page 0 on a new search
      this.loadContracts();
    });
  }

  // NEW: Called directly from HTML input
  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  // CHANGED: Pass currentSearchQuery to the service
  private loadContracts(): void {
    this.isLoading = true;

    this.contractService.getAllContracts(this.currentPage, this.pageSize, this.currentSearchQuery).subscribe({
      next: (data: any) => {
        this.contracts = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.currentPage = data.number;
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

  logBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);
    if (quantity > 0) {
      this.contractService.bookRoom(roomId, quantity).subscribe({
        next: () => {
          Swal.fire({
            title: 'Booked!',
            text: 'Booking logged successfully! Inventory updated.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadContracts();
        },
        error: (err) => {
          Swal.fire({
            title: 'Booking Failed',
            text: err.error || 'Failed to log booking. Check inventory limits.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      Swal.fire('Invalid Input', 'Please enter a valid quantity greater than 0.', 'warning');
    }
  }

  releaseBooking(roomId: number, quantityInput: string): void {
    const quantity = parseInt(quantityInput, 10);
    if (quantity > 0) {
      this.contractService.releaseRoom(roomId, quantity).subscribe({
        next: () => {
          Swal.fire({
            title: 'Released!',
            text: 'Rooms released successfully! Inventory added back.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadContracts();
        },
        error: (err) => {
          Swal.fire({
            title: 'Release Failed',
            text: err.error || 'Failed to release rooms. Check contract limits.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      Swal.fire('Invalid Input', 'Please enter a valid quantity greater than 0.', 'warning');
    }
  }

  isExpired(validToDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(validToDate);
    return expirationDate < today;
  }
}