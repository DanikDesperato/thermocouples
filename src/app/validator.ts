import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
      return { range: { min, max, actual: value } };
    }
    return null;
  };
}
