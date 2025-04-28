import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
} from 'react-hook-form';

import type { MobxForm } from './mobx-form.js';

export type AnyMobxForm = MobxForm<any, any, any>;

/**
 * Additional options for {@link MobxForm} constructor
 */
export interface MobxFormParams<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> extends UseFormProps<TFieldValues, TContext, TTransformedValues> {
  /**
   * Abort signal for mobx form
   */
  abortSignal?: AbortSignal;
  /**
   * Form submit handler
   */
  onSubmit?: SubmitHandler<TTransformedValues>;
  /**
   * Form submit failed handler
   */
  onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
  /**
   * Form reset handler
   */
  onReset?: VoidFunction;
}

export type ExtractFormFieldValues<T extends AnyMobxForm> = Exclude<
  T['params']['values'],
  undefined | null
>;

export type ExtractFormContext<T extends AnyMobxForm> = Exclude<
  T['params']['context'],
  undefined | null
>;

export type ExtractFormFieldOutputValues<T extends AnyMobxForm> =
  T extends MobxForm<any, any, infer TFieldOutputValues>
    ? TFieldOutputValues
    : never;
