import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotelService } from '../../core/services/hotel';
import { Hotel } from '../../core/models/hotel';

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

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.hotelForm = this.fb.group({
      hotelName: ['', [Validators.required, Validators.minLength(3)]]
    });
    this.loadHotels();
  }

  loadHotels(): void {
    this.hotelService.getAllHotels().subscribe({
      next: (data) => this.hotels = data,
      error: (err) => console.error('Failed to load hotels', err)
    });
  }

  onSubmit(): void {
    if (this.hotelForm.valid) {
      this.hotelService.createHotel(this.hotelForm.value).subscribe({
        next: (newHotel) => {
          this.successMessage = 'Hotel added successfully!';
          this.errorMessage = '';
          this.hotelForm.reset();
          this.loadHotels(); // Refresh the list instantly
        },
        error: (err) => {
          this.errorMessage = 'Failed to add hotel. Please try again.';
          this.successMessage = '';
        }
      });
    }
  }
}