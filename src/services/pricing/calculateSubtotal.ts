import { config } from '../../config/config';

/**
 * Calculate subtotal before discount
 */
export function calculateSubtotal(quantity: number): number {
  return quantity * config.device.price;
}
