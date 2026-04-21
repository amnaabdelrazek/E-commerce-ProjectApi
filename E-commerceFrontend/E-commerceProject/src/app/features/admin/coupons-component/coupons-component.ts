import { routes } from './../../../app.routes';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminService, Coupon } from '../../../core/services/admin.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-coupons-component',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './coupons-component.html',
  styleUrl: './coupons-component.css',
})
export class CouponsComponent implements OnInit{
  private adminService = inject(AdminService);
  private router = inject(Router);
  coupons = signal<Coupon[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  activeCouponsCount = computed(() => 
    this.coupons().filter(c => c.isActive).length
  );

  ngOnInit(): void {
    console.log('Loading coupons...');
    this.loadCoupons();
  }

// coupons-component.ts
loadCoupons(): void {
  this.isLoading.set(true);
  this.adminService.getCoupons().subscribe({
    next: (res) => {
      // هنا res هي المصفوفة مباشرة [ {id: 1, ...}, {id: 2, ...} ]
      console.log('Data received:', res); 
      this.coupons.set(res); 
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Fetch error:', err);
      this.errorMessage.set("Can't load coupons");
      this.isLoading.set(false);
    }
  });
}

  onDelete(id: number): void{
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true 
    }).then((result) =>{
      if(result.isConfirmed){
        this.adminService.deleteCoupon(id).subscribe({
          next: (res : any) =>{
            if(res && res.isSuccess){
              this.coupons.update(prev => prev.filter(c=> c.id !== id));

              Swal.fire({
                title: 'Deleted!',
                text: 'The coupon has been deleted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            }
          },
          error: () => {
            Swal.fire('Error!', 'Something went wrong on the server.', 'error');
          }
        });
      }
    });
  }
  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  
}

