import { LinkedAbortController } from 'linked-abort-controller';
import { action, makeObservable, observable, reaction } from 'mobx';
import {
  DeepPartial,
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
> {
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
  form: Maybe<UseFormReturn<TFieldValues, TContext, TFieldOutputValues>>;

  /**
   * form state received from form.formState
   */
  state: FormState<TFieldValues>;

  /**
   * Raw data received from form.getValues()
   */
  data: Maybe<DeepPartial<TFieldValues>>;

  protected isConnected = false;

  private stateKeys: string[];

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

    this.stateKeys = Object.keys(this.state);

    this.params = config;

    this.stateKeys.forEach((key) => {
      observable.deep(this.state, key);
    });
    observable.deep(this, 'data');
    observable.ref(this, 'params');
    action.bound(this, 'setParams');
    action.bound(this, 'updateParams');
    action.bound(this, 'syncForm');

    makeObservable(this);

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

  protected syncForm(
    formResult: UseFormReturn<TFieldValues, TContext, TFieldOutputValues>,
    data: DeepPartial<TFieldValues> = formResult.getValues() as any,
  ) {
    this.form = formResult;
    this.stateKeys.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.state[key] = formResult.formState[key];
    });
    this.data = data;
  }

  /**
   * Needed to connect real react-hook-form to this mobx wrapper
   *
   * This is used in useMobxForm
   */
  protected connect(
    formResult: UseFormReturn<TFieldValues, TContext, TFieldOutputValues>,
  ): ConnectedMobxForm<TFieldValues, TContext, TFieldOutputValues> {
    if (!this.isConnected) {
      this.isConnected = true;

      this.syncForm(formResult);

      const formWatchSubscription = formResult.watch((values) => {
        this.syncForm(formResult, values);
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (...args) => this.handleSubmit(...(args as any[])),
        (...args) => this.handleSubmitFailed(...args),
      ),
      handleSubmit: (onValid, onInvalid) => {
        return formResult.handleSubmit(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          async (...args) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await this.handleSubmit(...(args as any[]));
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

  /**
   * @deprecated use destroy();
   */
  dispose(): void {
    this.abortController.abort();
  }
}
