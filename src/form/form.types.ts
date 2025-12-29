import type {
  DeepPartial,
  FieldError,
  FieldPath,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
} from 'react-hook-form';
import type { MaybeFn } from 'yummies/types';
import type { Form } from './form.js';

export type AnyForm = Form<any, any, any>;
/**
 * @deprecated ⚠️ use `AnyForm`. This export will be removed in next major release
 */
export type AnyMobxForm = AnyForm;

/**
 * Additional options for {@link Form} constructor
 */
export interface FormParams<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> extends Omit<
    UseFormProps<TFieldValues, TContext, TTransformedValues>,
    'defaultValues'
  > {
  /**
   * Async is not supported
   */
  defaultValues?: MaybeFn<DeepPartial<TFieldValues>>;
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
  onReset?: (event: any) => void;
  /**
   * lazy mobx form state updates using setTimeout
   * @defaults `true`
   */
  lazyUpdates?: boolean;
  /**
   * lazy mobx form state updates timer in ms
   * @defaults `0`
   */
  lazyUpdatesTimer?: number;
  /**
   * Allows to check on existing errors in submit handler
   */
  strictSubmitChecks?: boolean;
}

/**
 * @deprecated ⚠️ use `FormParams`. This export will be removed in next major release
 */
export type MobxFormParams<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = FormParams<TFieldValues, TContext, TTransformedValues>;

export type ExtractFormFieldValues<T extends AnyForm> = Exclude<
  T['values'],
  undefined | null
>;

export type ExtractFormFieldOutputValues<T extends AnyForm> = T extends Form<
  any,
  any,
  infer TFieldOutputValues
>
  ? TFieldOutputValues
  : never;

export interface ErrorWithPath<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  path: TFieldName;
  error: FieldError;
}
