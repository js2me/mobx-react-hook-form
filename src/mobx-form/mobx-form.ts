/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LinkedAbortController } from 'linked-abort-controller';
import { action, comparer, makeObservable, observable, reaction } from 'mobx';
import { BaseSyntheticEvent } from 'react';
import {
  Control,
  createFormControl,
  DeepMap,
  DeepPartial,
  DefaultValues,
  FieldErrors,
  FieldValues,
  FormState,
  UseFormClearErrors,
  UseFormRegister,
  UseFormReset,
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormTrigger,
  UseFormUnregister,
} from 'react-hook-form';

import { MobxFormParams } from './mobx-form.types.js';

type FormFullState<TFieldValues extends FieldValues> =
  FormState<TFieldValues> & {
    values: TFieldValues;
  };

export class MobxForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> implements FormFullState<TFieldValues>
{
  values!: TFieldValues;
  isDirty: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  isSubmitSuccessful: boolean = false;
  isSubmitting: boolean = false;
  isValidating: boolean = false;
  isValid: boolean = false;
  disabled: boolean = false;
  submitCount: number = 0;
  defaultValues: Readonly<DeepPartial<TFieldValues>> | undefined;
  dirtyFields: Partial<Readonly<DeepMap<DeepPartial<TFieldValues>, boolean>>> =
    {};
  touchedFields: Partial<
    Readonly<DeepMap<DeepPartial<TFieldValues>, boolean>>
  > = {};
  validatingFields: Partial<
    Readonly<DeepMap<DeepPartial<TFieldValues>, boolean>>
  > = {};
  errors: FieldErrors<TFieldValues> = {};
  isReady: boolean = false;

  /**
   * Set an error for the field. When set an error which is not associated to a field then manual `clearErrors` invoke is required.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/seterror) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-seterror-nfxxu) • [Video](https://www.youtube.com/watch?v=raMqvE0YyIY)
   *
   * @param name - the path name to the form field value.
   * @param error - an error object which contains type and optional message
   * @param options - whether or not to focus on the field
   *
   * @example
   * ```tsx
   * // when the error is not associated with any fields, `clearError` will need to invoke to clear the error
   * const onSubmit = () => setError("serverError", { type: "server", message: "Error occurred"})
   *
   * <button onClick={() => setError("name", { type: "min" })} />
   *
   * // focus on the input after setting the error
   * <button onClick={() => setError("name", { type: "max" }, { shouldFocus: true })} />
   * ```
   */
  setError: UseFormSetError<TFieldValues>;

  /**
   * Clear the entire form errors.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/clearerrors) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-clearerrors-w3ymx)
   *
   * @param name - the path name to the form field value.
   *
   * @example
   * Clear all errors
   * ```tsx
   * clearErrors(); // clear the entire form error
   * clearErrors(["name", "name1"]) // clear an array of fields' error
   * clearErrors("name2"); // clear a single field error
   * ```
   */
  clearErrors: UseFormClearErrors<TFieldValues>;

  /**
   * Trigger field or form validation
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/trigger) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-triggervalidation-forked-xs7hl) • [Video](https://www.youtube.com/watch?v=-bcyJCDjksE)
   *
   * @param name - provide empty argument will trigger the entire form validation, an array of field names will validate an array of fields, and a single field name will only trigger that field's validation.
   * @param options - should focus on the error field
   *
   * @returns validation result
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   trigger();
   * }, [trigger])
   *
   * <button onClick={async () => {
   *   const result = await trigger(); // result will be a boolean value
   * }}>
   *  trigger
   *  </button>
   * ```
   */
  trigger: UseFormTrigger<TFieldValues>;

  /**
   * Reset a field state and reference.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/resetfield) • [Demo](https://codesandbox.io/s/priceless-firefly-d0kuv) • [Video](https://www.youtube.com/watch?v=IdLFcNaEFEo)
   *
   * @param name - the path name to the form field value.
   * @param options - keep form state options
   *
   * @example
   * ```tsx
   * <input {...register("firstName", { required: true })} />
   * <button type="button" onClick={() => resetField("firstName"))}>Reset</button>
   * ```
   */
  resetField: UseFormResetField<TFieldValues>;

  /**
   * Unregister a field reference and remove its value.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/unregister) • [Demo](https://codesandbox.io/s/react-hook-form-unregister-4k2ey) • [Video](https://www.youtube.com/watch?v=TM99g_NW5Gk&feature=emb_imp_woyt)
   *
   * @param name - the path name to the form field value.
   * @param options - keep form state options
   *
   * @example
   * ```tsx
   * register("name", { required: true })
   *
   * <button onClick={() => unregister("name")} />
   * // there are various keep options to retain formState
   * <button onClick={() => unregister("name", { keepErrors: true })} />
   * ```
   */
  unregister: UseFormUnregister<TFieldValues>;

  /**
   * Form control
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/control)
   *
   */
  control: Control<TFieldValues, TContext, TTransformedValues>;

  /**
   * Register field into hook form with or without the actual DOM ref. You can invoke register anywhere in the component including at `useEffect`.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/register) • [Demo](https://codesandbox.io/s/react-hook-form-register-ts-ip2j3) • [Video](https://www.youtube.com/watch?v=JFIpCoajYkA)
   *
   * @param name - the path name to the form field value, name is required and unique
   * @param options - register options include validation, disabled, unregister, value as and dependent validation
   *
   * @returns onChange, onBlur, name, ref, and native contribute attribute if browser validation is enabled.
   *
   * @example
   * ```tsx
   * // Register HTML native input
   * <input {...register("input")} />
   * <select {...register("select")} />
   *
   * // Register options
   * <textarea {...register("textarea", { required: "This is required.", maxLength: 20 })} />
   * <input type="number" {...register("name2", { valueAsNumber: true })} />
   * <input {...register("name3", { deps: ["name2"] })} />
   *
   * // Register custom field at useEffect
   * useEffect(() => {
   *   register("name4");
   *   register("name5", { value: "hiddenValue" });
   * }, [register])
   *
   * // Register without ref
   * const { onChange, onBlur, name } = register("name6")
   * <input onChange={onChange} onBlur={onBlur} name={name} />
   * ```
   */
  register: UseFormRegister<TFieldValues>;

  /**
   * Set focus on a registered field. You can start to invoke this method after all fields are mounted to the DOM.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/setfocus) • [Demo](https://codesandbox.io/s/setfocus-rolus)
   *
   * @param name - the path name to the form field value.
   * @param options - input focus behavior options
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   setFocus("name");
   * }, [setFocus])
   * // shouldSelect allows to select input's content on focus
   * <button onClick={() => setFocus("name", { shouldSelect: true })}>Focus</button>
   * ```
   */
  setFocus: UseFormSetFocus<TFieldValues>;

  /**
   * Set a single field value, or a group of fields value.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/setvalue) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-setvalue-8z9hx) • [Video](https://www.youtube.com/watch?v=qpv51sCH3fI)
   *
   * @param name - the path name to the form field value.
   * @param value - field value
   * @param options - should validate or update form state
   *
   * @example
   * ```tsx
   * // Update a single field
   * setValue('name', 'value', {
   *   shouldValidate: true, // trigger validation
   *   shouldTouch: true, // update touched fields form state
   *   shouldDirty: true, // update dirty and dirty fields form state
   * });
   *
   * // Update a group fields
   * setValue('root', {
   *   a: 'test', // setValue('root.a', 'data')
   *   b: 'test1', // setValue('root.b', 'data')
   * });
   *
   * // Update a nested object field
   * setValue('select', { label: 'test', value: 'Test' });
   * ```
   */
  setValue: UseFormSetValue<TFieldValues>;

  /**
   * Reset at the entire form state.
   *
   * @remarks
   * [API](https://react-hook-form.com/docs/useform/reset) • [Demo](https://codesandbox.io/s/react-hook-form-reset-v7-ts-pu901) • [Video](https://www.youtube.com/watch?v=qmCLBjyPwVk)
   *
   * @param values - the entire form values to be reset
   * @param keepStateOptions - keep form state options
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   // reset the entire form after component mount or form defaultValues is ready
   *   reset({
   *     fieldA: "test"
   *     fieldB: "test"
   *   });
   * }, [reset])
   *
   * // reset by combine with existing form values
   * reset({
   *   ...getValues(),
   *  fieldB: "test"
   *});
   *
   * // reset and keep form state
   * reset({
   *   ...getValues(),
   *}, {
   *   keepErrors: true,
   *   keepDirty: true
   *});
   * ```
   */
  resetForm: UseFormReset<TFieldValues>;

  protected abortController: AbortController;

  protected lastRafId: number | undefined;

  /**
   * Original react-hook-form form
   */
  originalForm: ReturnType<
    typeof createFormControl<TFieldValues, TContext, TTransformedValues>
  >;

  constructor(
    private config: MobxFormParams<TFieldValues, TContext, TTransformedValues>,
  ) {
    this.abortController = new LinkedAbortController(config.abortSignal);

    this.originalForm = createFormControl<
      TFieldValues,
      TContext,
      TTransformedValues
    >(config);

    this.setError = this.originalForm.setError;
    this.clearErrors = this.originalForm.clearErrors;
    this.trigger = this.originalForm.trigger;
    this.resetField = this.originalForm.resetField;
    this.unregister = this.originalForm.unregister;
    this.control = this.originalForm.control;
    this.register = this.originalForm.register;
    this.setFocus = this.originalForm.setFocus;
    this.setValue = this.originalForm.setValue;
    this.resetForm = this.originalForm.reset;

    Object.assign(this, {
      values: this.originalForm.getValues(),
      defaultValues: config.defaultValues || ({} as any),
    });

    const subscription = this.originalForm.subscribe({
      formState: {
        values: true,
        errors: true,
        isValid: true,
        isDirty: true,
        isValidating: true,
        dirtyFields: true,
        touchedFields: true,
        validatingFields: true,
      },
      callback: (rawFormState) => {
        if (this.config.lazyUpdates === false) {
          this.updateFormState(rawFormState);
        } else {
          if (this.lastRafId !== undefined) {
            cancelAnimationFrame(this.lastRafId);
            this.lastRafId = undefined;
          }
          this.lastRafId = requestAnimationFrame(() => {
            this.updateFormState(rawFormState);
            this.lastRafId = undefined;
          });
        }
      },
    });

    observable.deep(this, 'values');
    observable.ref(this, 'isDirty');
    observable.ref(this, 'isLoading');
    observable.ref(this, 'isSubmitted');
    observable.ref(this, 'isSubmitSuccessful');
    observable.ref(this, 'isSubmitting');
    observable.ref(this, 'isValidating');
    observable.ref(this, 'isValid');
    observable.ref(this, 'disabled');
    observable.ref(this, 'submitCount');
    observable.ref(this, 'isReady');
    observable.deep(this, 'defaultValues');
    observable.deep(this, 'dirtyFields');
    observable.deep(this, 'touchedFields');
    observable.deep(this, 'validatingFields');
    observable.deep(this, 'errors');
    action(this, 'updateFormState');

    observable.ref(this, 'originalForm');
    action.bound(this, 'submit');
    action.bound(this, 'reset');

    reaction(
      () => this.defaultValues,
      (newDefaultValues) => {
        if (newDefaultValues) {
          this.resetForm(
            newDefaultValues as unknown as DefaultValues<TFieldValues>,
          );
        }
      },
      {
        signal: this.abortController.signal,
      },
    );

    makeObservable(this);

    this.abortController.signal.addEventListener('abort', () => {
      subscription();
      // @ts-ignore
      this.originalForm = null;
      // @ts-ignore
      this.data = null;
    });
  }

  /**
   * Method to manually submit form.
   * Used to attach this method to <form /> element
   *
   * @example
   *
   * <form onSubmit={form.submit} />
   */
  submit(e?: BaseSyntheticEvent) {
    return new Promise<TTransformedValues>((resolve, reject) => {
      this.originalForm.handleSubmit(
        (data, event) => {
          this.config.onSubmit?.(data, event);
          resolve(data);
        },
        (errors, event) => {
          this.config.onSubmitFailed?.(errors, event);
          reject(errors);
        },
      )(e);
    });
  }

  /**
   * Method to manually reset all form.
   * Used to attach this method to <form /> element
   *
   * @example
   *
   * <form onReset={form.reset} />
   */
  reset(e?: BaseSyntheticEvent) {
    this.resetForm();
    this.config.onReset?.(e);
  }

  private updateFormState({
    values,
    errors,
    ...simpleProperties
  }: Partial<FormFullState<TFieldValues>>) {
    Object.entries(simpleProperties).forEach(([key, value]) => {
      if (value != null) {
        // @ts-ignore
        this[key] = value;
      }
    });

    if (errors) {
      const currentErrorsSet = new Set(Object.keys(this.errors));
      const newErrors = Object.keys(errors);

      for (const errorField of newErrors) {
        if (currentErrorsSet.has(errorField)) {
          currentErrorsSet.delete(errorField);
          if (
            !comparer.structural(this.errors[errorField], errors[errorField])
          ) {
            // @ts-ignore
            Object.assign(this.errors[errorField], errors[errorField]);
          }
        } else {
          // @ts-ignore
          this.errors[errorField] = errors[errorField];
        }
      }

      currentErrorsSet.forEach((errorField) => {
        // @ts-ignore
        delete this.errors[errorField];
      });
    } else {
      this.errors = {};
    }

    // @ts-ignore
    this.values = values ?? {};
  }

  destroy(): void {
    this.abortController.abort();
    if (this.lastRafId !== undefined) {
      cancelAnimationFrame(this.lastRafId);
    }
  }
}
