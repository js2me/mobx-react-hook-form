import { typeGuard } from 'yummies/type-guard';
import type { FieldError } from '../form/rhf-compat.js';

export const isFieldError = (value: unknown): value is FieldError => {
  return typeGuard.isObject(value) && 'type' in value;
};
