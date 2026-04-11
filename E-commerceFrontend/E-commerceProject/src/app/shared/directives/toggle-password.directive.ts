import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTogglePassword]',
  standalone: true
})
export class TogglePasswordDirective {
  @Input({ required: true }) appTogglePassword!: HTMLInputElement;

  private visible = false;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {
    this.renderer.setAttribute(this.host.nativeElement, 'type', 'button');
    this.renderer.setAttribute(this.host.nativeElement, 'aria-pressed', 'false');
  }

  @HostListener('click')
  onClick() {
    if (!this.appTogglePassword) return;
    this.visible = !this.visible;
    this.appTogglePassword.type = this.visible ? 'text' : 'password';
    this.renderer.setAttribute(this.host.nativeElement, 'aria-pressed', String(this.visible));
    this.renderer.setAttribute(
      this.host.nativeElement,
      'aria-label',
      this.visible ? 'Hide password' : 'Show password'
    );
  }
}

