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

  // NEW: Pagination State
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // NEW: Cache the payload so navigating pages doesn't break if the user edits the form
  private currentSearchPayload!: SearchRequest;

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
      const formValue = this.searchForm.value;
      const finalRoomRequests: RoomRequest[] = [];

      for (const row of formValue.roomRequests) {
        for (let i = 0; i < row.roomQuantity; i++) {
          finalRoomRequests.push({ noOfAdults: row.noOfAdults });
        }
      }

      this.currentSearchPayload = {
        checkInDate: formValue.checkInDate,
        noOfNights: formValue.noOfNights,
        roomRequests: finalRoomRequests
      };

      this.currentPage = 0; // Always start on page 1 for a new search
      this.executeSearch(); // Call the actual API method

    } else {
      this.searchForm.markAllAsTouched();
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all required search fields correctly before searching.',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
    }
  }

  // NEW: The actual API call method used by onSubmit and the Pagination buttons
  private executeSearch(): void {
    this.isSearching = true;
    this.hasSearched = false;
    this.errorMessage = '';

    this.searchService.searchAvailableRooms(this.currentSearchPayload, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        // Extract the paginated data
        this.results = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.currentPage = data.number;

        this.hasSearched = true;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search failed', err);
        this.errorMessage = 'Failed to execute search. Please verify your backend connection.';
        this.isSearching = false;
        this.cdr.detectChanges();
        Swal.fire({
          title: 'Search Failed',
          text: 'Could not connect to the server to find available rooms.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // NEW: Pagination Navigation
  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.executeSearch();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.executeSearch();
    }
  }
}