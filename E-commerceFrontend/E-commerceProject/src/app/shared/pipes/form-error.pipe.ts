import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'formError',
  standalone: true
})
export class FormErrorPipe implements PipeTransform {
  transform(control: AbstractControl | null | undefined, label = 'This field'): string | null {
    if (!control) return null;
    const errors = control.errors as ValidationErrors | null;
    if (!errors) return null;

    if (errors['required']) return `${label} is required.`;
    if (errors['email']) return `Please enter a valid email address.`;
    if (errors['minlength'])
      return `${label} must be at least ${errors['minlength']?.requiredLength ?? ''} characters.`;
    if (errors['maxlength'])
      return `${label} must be at most ${errors['maxlength']?.requiredLength ?? ''} characters.`;

    const firstKey = Object.keys(errors)[0];
    return firstKey ? `${label} is invalid.` : null;
  }
}

