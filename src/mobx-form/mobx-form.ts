import type { Disposable } from 'disposer-util';
import { LinkedAbortController } from 'linked-abort-controller';
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import {
  FormState,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import type { AnyObject, Maybe } from 'yummies/utils/types';

import { ConnectedMobxForm, MobxFormParams } from './mobx-form.types';

export class MobxForm<
  TFieldValues extends AnyObject,
  TContext = any,
  TFieldOutputValues extends AnyObject = TFieldValues,
> implements Disposable
{
  protected abortController: AbortController;

  /**
   * Real react-hook-form params
   * Needed to connect real react-hook-form to this mobx wrapper
   */
  params: UseFormProps<TFieldValues, TContext>;

  protected handleSubmit(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...args: Parameters<SubmitHandler<TFieldOutputValues>>
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
  form: Maybe<UseFormReturn<TFieldValues, TContext>>;

  /**
   * form state received from form.formState
   */
  state: FormState<TFieldValues>;

  /**
   * Raw data received from form.getValues()
   */
  data: Maybe<TFieldValues>;

  protected isConnected = false;

  constructor(
    private config: MobxFormParams<TFieldValues, TContext, TFieldOutputValues>,
  ) {
    this.abortController = new LinkedAbortController(config.abortSignal);

    // eslint-disable-next-line sonarjs/deprecation
    if (config.disposer) {
      // eslint-disable-next-line sonarjs/deprecation
      config.disposer.add(() => this.dispose());
    }

    this.abortController.signal.addEventListener('abort', () => {
      this.form = null;
      this.data = null;
    });

    this.state = {
      disabled: false,
      errors: {},
      isDirty: false,
      isLoading: false,
      isSubmitSuccessful: false,
      isSubmitted: false,
      isValid: false,
      isValidating: false,
      isSubmitting: false,
      submitCount: 0,
      touchedFields: {},
      defaultValues: undefined,
      dirtyFields: {},
      validatingFields: {},
    };

    this.params = config;

    makeObservable<this, 'params'>(this, {
      state: observable.deep,
      data: observable.deep,
      params: observable.ref,
      setParams: action.bound,
      updateParams: action.bound,
    });

    if (config.getParams) {
      reaction(
        config.getParams,
        (params) => {
          this.updateParams(params);
        },
        {
          signal: this.abortController.signal,
        },
      );
    }
  }

  /**
   * Allows to modify real react-hook-form useForm() payload
   */
  setParams(params: UseFormProps<TFieldValues, TContext>) {
    this.params = params;
  }

  /**
   * Allows to modify real react-hook-form useForm() payload
   */
  updateParams(params: Partial<UseFormProps<TFieldValues, TContext>>) {
    this.setParams({ ...this.params, ...params });
  }

  /**
   * Needed to connect real react-hook-form to this mobx wrapper
   *
   * This is used in useMobxForm
   */
  protected connect(
    formResult: UseFormReturn<TFieldValues, TContext>,
  ): ConnectedMobxForm<TFieldValues, TContext> {
    if (!this.isConnected) {
      this.isConnected = true;

      runInAction(() => {
        this.form = formResult;
        this.state = formResult.formState;
        this.data = formResult.getValues();
      });

      const formWatchSubscription = formResult.watch(() => {
        runInAction(() => {
          this.form = formResult;
          this.state = formResult.formState;
          this.data = formResult.getValues();
        });
      });

      this.abortController.signal.addEventListener(
        'abort',
        formWatchSubscription.unsubscribe,
      );
    }

    return {
      ...formResult,
      onReset: () => this.handleReset(),
      onSubmit: formResult.handleSubmit(
        (...args) =>
          this.handleSubmit(
            ...(args as unknown as Parameters<
              SubmitHandler<TFieldOutputValues>
            >),
          ),
        (...args) => this.handleSubmitFailed(...args),
      ),
      handleSubmit: (onValid, onInvalid) => {
        return formResult.handleSubmit(
          async (...args) => {
            await this.handleSubmit(
              ...(args as unknown as Parameters<
                SubmitHandler<TFieldOutputValues>
              >),
            );
            await onValid(...args);
          },
          async (...args) => {
            await this.handleSubmitFailed(...args);
            await onInvalid?.(...args);
          },
        );
      },
    };
  }

  dispose(): void {
    this.abortController.abort();
  }
}
