/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LinkedAbortController } from 'linked-abort-controller';
import { action, computed, makeObservable, observable } from 'mobx';
import {
  createFormControl,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
} from 'react-hook-form';

import { MobxFormState, MobxFormStateReadonly } from './mobx-form-state.js';
import { MobxFormParams } from './mobx-form.types.js';

export class MobxForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> {
  protected abortController: AbortController;

  /**
   * Real react-hook-form params
   * Needed to connect real react-hook-form to this mobx wrapper
   */
  params: UseFormProps<TFieldValues, TContext, TTransformedValues>;

  protected handleSubmit(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...args: Parameters<SubmitHandler<TTransformedValues>>
  ): void | Promise<void> {
    this.config.onSubmit?.(...args);
    // used to override
  }

  protected handleSubmitFailed(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...args: Parameters<SubmitErrorHandler<TFieldValues>>
  ): void | Promise<void> {
    this.config.onSubmitFailed?.(...args);
    // used to override
  }

  protected handleReset() {
    this.config.onReset?.();
    // used to override
  }

  /**
   * Original react-hook-form form
   */
  form: ReturnType<
    typeof createFormControl<TFieldValues, TContext, TTransformedValues>
  >;

  /**
   * form state received from form.formState
   */
  private _state: MobxFormState<TFieldValues>;

  get state(): MobxFormStateReadonly<TFieldValues> {
    return this._state;
  }

  /**
   * Raw data received from form.getValues()
   */
  get data(): TFieldValues {
    return this._state.values;
  }

  constructor(
    private config: MobxFormParams<TFieldValues, TContext, TTransformedValues>,
  ) {
    this.params = config;
    this.abortController = new LinkedAbortController(config.abortSignal);

    this.form = createFormControl<TFieldValues, TContext, TTransformedValues>(
      config,
    );
    this._state = new MobxFormState({
      values: this.form.getValues(),
      defaultValues: config.defaultValues || ({} as any),
    });

    this.params = config;

    const subscription = this.form.subscribe({
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
        this._state.update(rawFormState);
      },
    });

    this.abortController.signal.addEventListener('abort', () => {
      subscription();
      // @ts-ignore
      this.form = null;
      // @ts-ignore
      this.data = null;
    });

    computed.struct(this, 'data');
    computed.struct(this, 'state');
    observable.ref(this, 'params');
    observable.ref(this, 'form');
    action.bound(this, 'setParams');
    action.bound(this, 'updateParams');
    action.bound(this, 'syncForm');

    makeObservable(this);
  }

  destroy(): void {
    this.abortController.abort();
  }

  submit = async (event?: any) => {
    if (this.config.onSubmit) {
      await this.form.handleSubmit(
        this.config.onSubmit,
        this.config.onSubmitFailed,
      )(event);
    }
  };

  reset = () => {
    this.form.reset();
  };
}
