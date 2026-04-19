import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../seller.service';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.css']
})
export class SellerProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private sellerService: SellerService) {
    this.profileForm = this.fb.group({
      storeName: ['', Validators.required],
      storeDescription: [''],
      businessAddress: ['', Validators.required],
      isApproved: [{ value: false, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.sellerService.getSellerProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          // It's normal for a new seller to not have a profile yet
          this.isLoading = false;
        } else {
          console.error('Failed to load profile', err);
          this.errorMessage = 'Failed to load profile details.';
          this.isLoading = false;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';

      const updatedProfile = this.profileForm.getRawValue();

      this.sellerService.updateSellerProfile(updatedProfile).subscribe({
        next: (res) => {
          this.successMessage = 'Profile updated successfully!';
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Failed to update profile', err);
          this.errorMessage = 'Failed to update profile.';
          this.isSaving = false;
        }
      });
    }
  }
}
