// src/app/pipes/date-format.pipe.ts
import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: string | Date, format: string = 'dd/MM/yyyy'): string {
    if (!value) return '';
    
    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      return formatDate(date, format, this.locale);
    } catch (e) {
      console.error('Error formatting date', e);
      return typeof value === 'string' ? value : value.toString();
    }
  }
}