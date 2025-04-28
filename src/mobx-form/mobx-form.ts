/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LinkedAbortController } from 'linked-abort-controller';
import { action, makeObservable, observable, runInAction } from 'mobx';
import {
  createFormControl,
  FieldValues,
  FormState,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
} from 'react-hook-form';
import { Maybe } from 'yummies/utils/types';

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
  state: Maybe<
    Partial<FormState<TFieldValues>> & {
      values: TFieldValues;
    }
  >;

  /**
   * Raw data received from form.getValues()
   */
  data: TFieldValues;

  constructor(
    private config: MobxFormParams<TFieldValues, TContext, TTransformedValues>,
  ) {
    this.params = config;
    this.abortController = new LinkedAbortController(config.abortSignal);

    this.form = createFormControl<TFieldValues, TContext, TTransformedValues>(
      config,
    );

    this.data = this.form.getValues();
    this.state = null;

    this.params = config;

    const subscription = this.form.subscribe({
      callback: (rawFormState) => {
        runInAction(() => {
          if (this.state) {
            Object.assign(this.state, rawFormState);
          } else {
            this.state = rawFormState;
          }
          Object.assign(this.data, rawFormState.values);
        });
      },
    });

    this.abortController.signal.addEventListener('abort', () => {
      subscription();
      // @ts-ignore
      this.form = null;
      // @ts-ignore
      this.data = null;
      // @ts-ignore
      this.state = null;
    });

    observable.deep(this, 'state');
    observable.deep(this, 'data');
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
