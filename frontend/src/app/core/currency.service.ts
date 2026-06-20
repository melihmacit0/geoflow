import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

// Mock prices from the backend are in USD. These static demo rates convert them
// into whatever currency the signed-in user picked in their profile preferences.
const RATES: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1,    symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  TRY: { rate: 32.5, symbol: '₺' },
  JPY: { rate: 155,  symbol: '¥' }
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private auth = inject(AuthService);

  /** Active 3-letter currency code derived from the signed-in user (defaults USD). */
  readonly code = computed(() => (this.auth.user()?.currency || 'USD').slice(0, 3).toUpperCase());

  /** Format a USD amount in the user's preferred currency, e.g. 480 → "€442". */
  format(usd: number | null | undefined): string {
    if (usd == null) return '';
    const { rate, symbol } = RATES[this.code()] || RATES['USD'];
    return symbol + Math.round(usd * rate).toLocaleString('en-US');
  }
}
