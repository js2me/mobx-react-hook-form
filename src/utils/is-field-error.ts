import type { FieldError } from 'react-hook-form';
import { typeGuard } from 'yummies/type-guard';

export const isFieldError = (value: unknown): value is FieldError => {
  return typeGuard.isObject(value) && 'type' in value;
};
