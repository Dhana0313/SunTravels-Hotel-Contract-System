import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SearchService } from '../../core/services/search';
import { SearchResult, SearchRequest, RoomRequest } from '../../core/models/search';

// 1. IMPORT SWEETALERT
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-engine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-engine.html',
  styleUrls: ['./search-engine.scss']
})
export class SearchEngine implements OnInit {
  searchForm!: FormGroup;
  results: SearchResult[] = [];

  // UI State variables
  hasSearched = false;
  isSearching = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      checkInDate: ['', Validators.required],
      noOfNights: [1, [Validators.required, Validators.min(1)]],
      roomRequests: this.fb.array([]) // Dynamic array for rooms
    });
    this.addRoomRequest(); // Start with exactly one room required
  }

  get roomRequests(): FormArray {
    return this.searchForm.get('roomRequests') as FormArray;
  }

  addRoomRequest(): void {
    const roomGroup = this.fb.group({
      noOfAdults: [1, [Validators.required, Validators.min(1)]],
      roomQuantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.roomRequests.push(roomGroup);
  }

  removeRoomRequest(index: number): void {
    if (this.roomRequests.length > 1) {
      this.roomRequests.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      this.isSearching = true;
      this.hasSearched = false;
      this.errorMessage = '';

      const formValue = this.searchForm.value;
      const finalRoomRequests: RoomRequest[] = [];

      // Loop through the UI rows and multiply them based on the quantity
      for (const row of formValue.roomRequests) {
        for (let i = 0; i < row.roomQuantity; i++) {
          finalRoomRequests.push({ noOfAdults: row.noOfAdults });
        }
      }

      // Build the final strict payload for Spring Boot
      const searchPayload: SearchRequest = {
        checkInDate: formValue.checkInDate,
        noOfNights: formValue.noOfNights,
        roomRequests: finalRoomRequests
      };
      // ----------------------------------------

      // Send the transformed payload instead of the raw form value
      this.searchService.searchAvailableRooms(searchPayload).subscribe({
        next: (data) => {
          this.results = data;
          this.hasSearched = true;
          this.isSearching = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Search failed', err);
          this.errorMessage = 'Failed to execute search. Please verify your backend connection.';
          this.isSearching = false;
          this.cdr.detectChanges();

          // 2. ADD SWEETALERT FOR API ERRORS
          Swal.fire({
            title: 'Search Failed',
            text: 'Could not connect to the server to find available rooms.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      this.searchForm.markAllAsTouched();

      // 3. ADD SWEETALERT FOR FORM VALIDATION
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all required search fields correctly before searching.',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}