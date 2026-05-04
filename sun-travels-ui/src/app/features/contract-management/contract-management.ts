import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HotelService } from '../../core/services/hotel';
import { ContractService } from '../../core/services/contract';
import { Hotel } from '../../core/models/hotel';

// 1. IMPORT SWEETALERT
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Required for structural directives and forms
  templateUrl: './contract-management.html',
  styleUrls: ['./contract-management.scss']
})
export class ContractManagement implements OnInit {
  contractForm!: FormGroup;
  hotels: Hotel[] = [];
  successMessage = '';
  errorMessage = '';

  // NEW: Autocomplete State Variables
  filteredHotels: Hotel[] = [];
  selectedHotelName = '';
  isDropdownOpen = false;

  // NEW: The RxJS Subject that acts as our search pipe
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private contractService: ContractService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupSearchListener();
  }

  // 1. Initialize the vertical form structure
  private initForm(): void {
    this.contractForm = this.fb.group({
      hotelId: ['', Validators.required],
      validFrom: ['', Validators.required],
      validTo: ['', Validators.required],
      markupPercentage: ['', [Validators.required, Validators.min(0)]],
      roomTypes: this.fb.array([]) // This is the dynamic array for rooms
    });
    this.addRoomType(); // Start with one empty room type box by default
  }

  // NEW: The RxJS Magic
  private setupSearchListener(): void {
    this.searchSubject.pipe(
      debounceTime(300),        // Wait 300ms after the user stops typing
      distinctUntilChanged(),   // Don't search again if the text is exactly the same
      switchMap((term: string) => this.hotelService.searchHotels(term)) // Cancel old searches and start a new one
    ).subscribe({
      next: (data) => {
        this.filteredHotels = data;
        this.isDropdownOpen = true; // Show the list once data arrives
      },
      error: (err) => console.error('Search failed', err)
    });
  }

  // CHANGED: Simply push the typed letters into the RxJS pipe
  onSearchType(event: any): void {
    const searchTerm = event.target.value.trim();
    this.selectedHotelName = event.target.value;

    if (searchTerm.length > 0) {
      // Drop the text into the pipe
      this.searchSubject.next(searchTerm);
    } else {
      // If the box is empty, clear everything and hide the dropdown
      this.filteredHotels = [];
      this.isDropdownOpen = false;
    }
  }

  selectHotel(hotel: Hotel): void {
    this.selectedHotelName = hotel.hotelName; // Update visible text
    this.isDropdownOpen = false;              // Hide dropdown

    // CRITICAL: Update the reactive form secretly in the background!
    this.contractForm.patchValue({ hotelId: hotel.id });
  }

  hideDropdown(): void {
    // Delay hiding slightly so the click event has time to register
    setTimeout(() => this.isDropdownOpen = false, 200);
  }

  // 3. Helper to easily access the roomTypes array in the HTML
  get roomTypes(): FormArray {
    return this.contractForm.get('roomTypes') as FormArray;
  }

  // 4. Add a new vertical room block
  addRoomType(): void {
    const roomGroup = this.fb.group({
      typeName: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      noOfRooms: ['', [Validators.required, Validators.min(1)]],
      maxAdults: ['', [Validators.required, Validators.min(1)]]
    });
    this.roomTypes.push(roomGroup);
  }

  // 5. Remove a room block
  removeRoomType(index: number): void {
    if (this.roomTypes.length > 1) {
      this.roomTypes.removeAt(index);
    }
  }

  // 6. Submit the payload to the backend
  onSubmit(): void {
    if (this.contractForm.valid) {
      this.contractService.saveContract(this.contractForm.value).subscribe({
        next: (res) => {
          this.successMessage = 'Contract saved successfully!';
          this.errorMessage = '';
          this.contractForm.reset();
          this.roomTypes.clear();
          this.addRoomType(); // Reset UI state
          this.selectedHotelName = '';

          // 3. ADD SWEETALERT SUCCESS TOAST
          Swal.fire({
            title: 'Contract Saved!',
            text: 'The new contract has been added to the system.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.errorMessage = 'Failed to save contract. Please check your data and try again.';
          this.successMessage = '';

          // 4. ADD SWEETALERT ERROR MODAL
          Swal.fire({
            title: 'Save Failed',
            text: err.error || 'Failed to save the contract. Please verify the details and try again.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      this.contractForm.markAllAsTouched(); // Highlights missing fields in red

      // 5. ADD SWEETALERT VALIDATION WARNING
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all required fields correctly before saving.',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}