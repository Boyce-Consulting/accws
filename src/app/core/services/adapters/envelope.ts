import { map, OperatorFunction } from 'rxjs';

export interface Envelope<T> {
  data: T;
}

export function unwrap<T>(): OperatorFunction<Envelope<T>, T> {
  return map((r) => r.data);
}

export function unwrapList<T, U>(mapper: (dto: T) => U): OperatorFunction<Envelope<T[]>, U[]> {
  return map((r) => r.data.map(mapper));
}

export function unwrapItem<T, U>(mapper: (dto: T) => U): OperatorFunction<Envelope<T>, U> {
  return map((r) => mapper(r.data));
}

export const fromCents = (cents?: number | null): number | undefined =>
  cents == null ? undefined : cents / 100;

export const toCents = (amount?: number | null): number | undefined =>
  amount == null ? undefined : Math.round(amount * 100);

export const toStringId = (id: number | string): string => String(id);
