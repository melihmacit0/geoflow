import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from './currency.service';

// Impure so prices re-render in the new currency after the user changes their
// preference, without needing a full page reload.
@Pipe({ name: 'gfPrice', standalone: true, pure: false })
export class PricePipe implements PipeTransform {
  private currency = inject(CurrencyService);

  transform(usd: number | null | undefined): string {
    return this.currency.format(usd);
  }
}
