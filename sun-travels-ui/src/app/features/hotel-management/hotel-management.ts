import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelService } from '../../core/services/hotel';
import { Hotel } from '../../core/models/hotel';

// 1. IMPORT SWEETALERT
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hotel-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hotel-management.html',
  styleUrls: ['./hotel-management.scss']
})
export class HotelManagementComponent implements OnInit {
  hotelForm!: FormGroup;
  hotels: Hotel[] = [];
  successMessage = '';
  errorMessage = '';

  // NEW: Pagination State
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.hotelForm = this.fb.group({
      hotelName: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.hotels = data.content; // Extract the array from Spring's Page object
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load hotels', err);
        Swal.fire({
          title: 'Connection Error',
          text: 'Failed to load the list of hotels from the server.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // NEW: Pagination Controls
  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadHotels();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHotels();
    }
  }

  onSubmit(): void {
    if (this.hotelForm.valid) {
      this.hotelService.createHotel(this.hotelForm.value).subscribe({
        next: (newHotel) => {
          this.successMessage = 'Hotel added successfully!';
          this.errorMessage = '';
          this.hotelForm.reset();

          // CHANGED: Jump to page 1 so they see the newest hotel instantly
          this.currentPage = 0; 
          this.loadHotels();

          // 3. ADD SWEETALERT SUCCESS TOAST
          Swal.fire({
            title: 'Hotel Added!',
            text: 'The new hotel has been successfully registered.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.errorMessage = 'Failed to add hotel. Please try again.';
          this.successMessage = '';
          this.cdr.detectChanges();

          // 4. ADD SWEETALERT ERROR MODAL
          Swal.fire({
            title: 'Action Failed',
            text: err.error || 'Failed to add the hotel. Please check your connection and try again.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      this.hotelForm.markAllAsTouched();

      // 5. ADD SWEETALERT VALIDATION WARNING
      Swal.fire({
        title: 'Invalid Input',
        text: 'Please enter a valid hotel name (at least 3 characters).',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}