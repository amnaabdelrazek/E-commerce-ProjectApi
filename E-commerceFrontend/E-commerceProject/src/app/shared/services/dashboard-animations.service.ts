/* ==========================================
   ANIMATIONS SERVICE - REUSABLE ANGULAR ANIMATIONS
   ========================================== */

import { Injectable } from '@angular/core';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger,
  state,
  keyframes
} from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class DashboardAnimationsService {

  /**
   * PAGE REVEAL ANIMATION
   * =====================
   * Smooth fade-in with slight slide-up for initial page load
   * Use on: Main dashboard container
   */
  static pageRevealAnimation = trigger('pageReveal', [
    transition(':enter', [
      style({ 
        opacity: 0, 
        transform: 'translateY(20px)' 
      }),
      animate('600ms ease-out', 
        style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        })
      )
    ]),
    transition(':leave', [
      animate('300ms ease-in', 
        style({ 
          opacity: 0, 
          transform: 'translateY(20px)' 
        })
      )
    ])
  ]);

  /**
   * HEADER SLIDE DOWN ANIMATION
   * ===========================
   * Header appears from top with smooth slide
   * Use on: Dashboard header section
   */
  static headerSlideAnimation = trigger('headerSlide', [
    transition(':enter', [
      style({ 
        opacity: 0, 
        transform: 'translateY(-20px)' 
      }),
      animate('400ms 100ms ease-out', 
        style({ 
          opacity: 1, 
          transform: 'translateY(0)' 
        })
      )
    ])
  ]);

  /**
   * STATS CARDS STAGGERED ANIMATION
   * ================================
   * Cards fade in with scale, staggered for visual interest
   * Use on: Stats grid container with [value]="statsArray"
   * 
   * Example:
   * <div @statsCardsAnimation [value]="stats" class="stats-grid">
   *   <div *ngFor="let stat of stats" class="stat-card">
   * </div>
   */
  static statsCardsAnimation = trigger('statsCardsAnimation', [
    transition('* => *', [
      query(':leave', 
        [
          stagger(30, [
            animate('300ms ease-in', 
              style({ opacity: 0, transform: 'scale(0.9)' })
            )
          ])
        ], 
        { optional: true }
      ),
      query(':enter', 
        [
          style({ 
            opacity: 0, 
            transform: 'translateY(20px) scale(0.95)' 
          }),
          stagger(80, [
            animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              })
            )
          ])
        ], 
        { optional: true }
      )
    ])
  ]);

  /**
   * STAT CARD SCALE HOVER ANIMATION
   * ================================
   * Individual stat card hover effect with scale and shadow
   * Use on: Individual stat cards with click or hover detection
   * 
   * Example:
   * <div @statCardHover (mouseenter)="hoverState = 'hover'" 
   *      (mouseleave)="hoverState = 'normal'" class="stat-card">
   */
  static statCardHoverAnimation = trigger('statCardHover', [
    state('normal', style({
      transform: 'scale(1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    })),
    state('hover', style({
      transform: 'scale(1.03) translateY(-4px)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
    })),
    transition('normal <=> hover', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
    ])
  ]);

  /**
   * TABLE ROWS STAGGERED FADE-IN
   * ============================
   * Dynamic rows fade in smoothly with staggered timing
   * Works with *ngFor for dynamic data loading
   * Use on: Table tbody wrapper with [value]="dataArray"
   * 
   * Example:
   * <tbody @tableRowsAnimation [value]="products.length">
   *   <tr *ngFor="let product of products">
   */
  static tableRowsAnimation = trigger('tableRowsAnimation', [
    transition('* => *', [
      query(':leave', 
        [
          stagger(50, [
            animate('300ms ease-in', 
              style({ 
                opacity: 0, 
                transform: 'translateX(-10px)' 
              })
            )
          ])
        ], 
        { optional: true }
      ),
      query(':enter', 
        [
          style({ 
            opacity: 0, 
            transform: 'translateX(-8px)' 
          }),
          stagger(50, [
            animate('300ms ease-out', 
              style({ 
                opacity: 1, 
                transform: 'translateX(0)' 
              })
            )
          ])
        ], 
        { optional: true }
      )
    ])
  ]);

  /**
   * TABLE ROW HOVER ANIMATION
   * =========================
   * Smooth highlight effect when row is hovered
   * Use on: Individual table row with mousenter/mouseleave
   * 
   * Example:
   * <tr @rowHighlight (mouseenter)="hoveredRow = i" 
   *     (mouseleave)="hoveredRow = -1">
   */
  static rowHighlightAnimation = trigger('rowHighlight', [
    state('normal', style({
      backgroundColor: 'transparent',
      boxShadow: 'none'
    })),
    state('hover', style({
      backgroundColor: 'rgba(79, 70, 229, 0.03)',
      boxShadow: 'inset 4px 0 0 rgba(79, 70, 229, 1)'
    })),
    transition('normal <=> hover', [
      animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
    ])
  ]);

  /**
   * ACTION BUTTON POP ANIMATION
   * ===========================
   * Quick scale animation for action buttons
   * Use on: Action button with click detection
   * 
   * Example:
   * <button @actionButtonPop (click)="onAction()">
   */
  static actionButtonPopAnimation = trigger('actionButtonPop', [
    state('normal', style({
      transform: 'scale(1)'
    })),
    state('clicked', style({
      transform: 'scale(1)'
    })),
    transition('* => clicked', [
      animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
        keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.15)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ])
      )
    ]),
    transition('* => normal', [
      animate('200ms ease-out')
    ])
  ]);

  /**
   * MODAL SCALE ANIMATION
   * =====================
   * Smooth scale-in animation for modals
   * Use on: Modal dialog container with [@modalScale]
   * 
   * Example:
   * <div @modalScale *ngIf="isModalOpen" class="modal">
   */
  static modalScaleAnimation = trigger('modalScale', [
    transition(':enter', [
      style({ 
        opacity: 0, 
        transform: 'scale(0.95)' 
      }),
      animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
        style({ 
          opacity: 1, 
          transform: 'scale(1)' 
        })
      )
    ]),
    transition(':leave', [
      animate('200ms ease-in', 
        style({ 
          opacity: 0, 
          transform: 'scale(0.95)' 
        })
      )
    ])
  ]);

  /**
   * SIDEBAR SLIDE ANIMATION
   * =======================
   * Sidebar slides in/out smoothly
   * Use on: Sidebar with [collapsed]="sidebarCollapsed"
   * 
   * Example:
   * <aside @sidebarSlide [ngClass]="{'collapsed': sidebarCollapsed}">
   */
  static sidebarSlideAnimation = trigger('sidebarSlide', [
    state('expanded', style({
      transform: 'translateX(0)',
      visibility: 'visible'
    })),
    state('collapsed', style({
      transform: 'translateX(-100%)',
      visibility: 'hidden'
    })),
    transition('expanded <=> collapsed', [
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
    ])
  ]);

  /**
   * LOADING SPINNER ANIMATION
   * =========================
   * Smooth rotation animation for loading spinners
   * Use on: Spinner element during data loading
   * 
   * Example:
   * <div @spinnerRotate *ngIf="isLoading" class="spinner">
   */
  static spinnerRotateAnimation = trigger('spinnerRotate', [
    state('spinning', style({
      transform: 'rotate(0deg)'
    })),
    transition('* => spinning', [
      animate('1200ms linear', 
        keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(360deg)', offset: 1 })
        ])
      )
    ])
  ]);

  /**
   * FADE IN STAGGER ANIMATION
   * =========================
   * Generic stagger fade-in for any list items
   * Use on: Any container with list items
   * 
   * Example:
   * <ul @fadeInStagger [value]="items.length">
   *   <li *ngFor="let item of items">
   */
  static fadeInStaggerAnimation = trigger('fadeInStagger', [
    transition('* => *', [
      query(':enter', 
        [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(50, [
            animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], 
        { optional: true }
      )
    ])
  ]);

  /**
   * STATUS BADGE PULSE ANIMATION
   * =============================
   * Subtle pulse effect for status badges
   * Use on: Status badge elements
   * 
   * Example:
   * <span @statusPulse [value]="status" class="status-badge">
   */
  static statusPulseAnimation = trigger('statusPulse', [
    state('active', style({
      boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.3)'
    })),
    transition('active', [
      animate('2s ease-in-out infinite', 
        keyframes([
          style({ 
            boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.3)', 
            offset: 0 
          }),
          style({ 
            boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)', 
            offset: 1 
          })
        ])
      )
    ])
  ]);
}

/**
 * HOW TO USE THESE ANIMATIONS
 * ===========================
 * 
 * 1. Import in your component:
 *    import { DashboardAnimationsService } from './dashboard-animations.service';
 * 
 * 2. Add to @Component decorator:
 *    @Component({
 *      animations: [
 *        DashboardAnimationsService.pageRevealAnimation,
 *        DashboardAnimationsService.statsCardsAnimation,
 *        DashboardAnimationsService.tableRowsAnimation
 *      ]
 *    })
 * 
 * 3. Use in template:
 *    <div @pageRevealAnimation class="dashboard">
 *      <div @statsCardsAnimation [value]="stats" class="stats-grid">
 *        <div *ngFor="let stat of stats" class="stat-card">
 * 
 * 4. For state-based animations:
 *    <div @statCardHover [ngClass]="hoverState"
 *         (mouseenter)="hoverState = 'hover'"
 *         (mouseleave)="hoverState = 'normal'">
 * 
 * 5. For click-triggered animations:
 *    actionState = 'normal';
 *    onAction() {
 *      this.actionState = 'clicked';
 *      setTimeout(() => this.actionState = 'normal', 400);
 *    }
 */
