import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private contractService: ContractService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadHotels();
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

  // 2. Load hotels for the dropdown
  private loadHotels(): void {
    this.hotelService.getAllHotels().subscribe({
      next: (data) => this.hotels = data,
      error: (err) => {
        console.error('Failed to load hotels', err);

        // 2. ADD SWEETALERT FOR API ERROR (Dropdown failure)
        Swal.fire({
          title: 'Connection Error',
          text: 'Failed to load the list of hotels. Please refresh the page or check your connection.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
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