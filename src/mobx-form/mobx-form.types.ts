import type { IDisposer } from 'disposer-util';
import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import type { AnyObject } from 'yummies/utils/types';

import type { MobxForm } from './mobx-form';

/**
 * Additional options for {@link MobxForm} constructor
 */
export interface MobxFormParams<
  TFieldValues extends AnyObject,
  TContext = any,
  TFieldOutputValues extends AnyObject = TFieldValues,
> extends UseFormProps<TFieldValues, TContext> {
  /**
   * Disposer for mobx form
   * @deprecated use {abortSignal} instead
   */
  disposer?: IDisposer;
  /**
   * Abort signal for mobx form
   */
  abortSignal?: AbortSignal;
  /**
   * Form submit handler
   */
  onSubmit?: SubmitHandler<TFieldOutputValues>;
  /**
   * Form submit failed handler
   */
  onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
  /**
   * Form reset handler
   */
  onReset?: VoidFunction;
  /**
   * Dynamic change react-hook-form params, works as reaction
   */
  getParams?: () => Partial<UseFormProps<TFieldValues, TContext>>;
}

/**
 * Interface for a connected Mobx form.
 * Extends the properties of react-hook-form's UseFormReturn,
 * Adds custom form handlers.
 */
export interface ConnectedMobxForm<
  TFieldValues extends AnyObject,
  TContext = any,
  TFieldOutputValues extends AnyObject = TFieldValues,
> extends UseFormReturn<TFieldValues, TContext, TFieldOutputValues> {
  /**
   * Handler to reset the form.
   */
  onReset: VoidFunction;
  /**
   * Handler to submit the form.
   */
  onSubmit: VoidFunction;
}

export type ExtractFormFieldValues<T extends MobxForm<any, any, any>> = Exclude<
  T['params']['values'],
  undefined | null
>;

export type ExtractFormContext<T extends MobxForm<any, any, any>> = Exclude<
  T['params']['context'],
  undefined | null
>;

export type ExtractFormFieldOutputValues<T extends MobxForm<any, any, any>> =
  T extends MobxForm<any, any, infer TFieldOutputValues>
    ? TFieldOutputValues
    : never;
