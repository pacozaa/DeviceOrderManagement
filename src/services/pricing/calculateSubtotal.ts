import { config } from '../../config/config';

export function calculateSubtotal(quantity: number): number {
  return quantity * config.device.price;
}
