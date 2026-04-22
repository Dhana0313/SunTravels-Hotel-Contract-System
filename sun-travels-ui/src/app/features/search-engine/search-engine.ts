import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SearchService } from '../../core/services/search';
import { SearchResult } from '../../core/models/search';

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
    private searchService: SearchService
  ) {}

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
      noOfAdults: [1, [Validators.required, Validators.min(1)]]
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

      this.searchService.searchAvailableRooms(this.searchForm.value).subscribe({
        next: (data) => {
          this.results = data;
          this.hasSearched = true;
          this.isSearching = false;
        },
        error: (err) => {
          console.error('Search failed', err);
          this.errorMessage = 'Failed to execute search. Please verify your backend connection.';
          this.isSearching = false;
        }
      });
    } else {
      this.searchForm.markAllAsTouched();
    }
  }
}