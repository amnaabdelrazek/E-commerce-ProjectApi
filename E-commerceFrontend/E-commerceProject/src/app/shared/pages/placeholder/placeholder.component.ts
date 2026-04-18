import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.css'
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] ?? 'Page';
  readonly description = this.route.snapshot.data['description'] ?? 'This page is not connected yet.';
  readonly primaryLabel = this.route.snapshot.data['primaryLabel'] ?? 'Go to Home';
  readonly primaryLink = this.route.snapshot.data['primaryLink'] ?? '/home';
  readonly secondaryLabel = this.route.snapshot.data['secondaryLabel'] ?? 'Browse Shop';
  readonly secondaryLink = this.route.snapshot.data['secondaryLink'] ?? '/shop';
}

