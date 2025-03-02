import { LinkedAbortController } from 'linked-abort-controller';
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import {
  DeepPartial,
  FormState,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  createFormControl,
} from 'react-hook-form';
import type { AnyObject, Maybe } from 'yummies/utils/types';

import { MobxFormParams } from './mobx-form.types';

const dependsOn = {
  isDirty: true,
  isLoading: true,
  isValidating: true,
  isValid: true,

  dirtyFields: true,
  touchedFields: true,
  validatingFields: true,
  errors: true,
};

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

  protected handleReset() {
    this.config.onReset?.();
    // used to override
  }

  /**
   * Original react-hook-form form
   */
  instance: Maybe<ReturnType<typeof createFormControl<TFieldValues, TContext>>>;

  /**
   * form state received from form.formState
   */
  state: FormState<TFieldValues>;

  /**
   * Raw data received from form.getValues()
   */
  data: Maybe<DeepPartial<TFieldValues>>;

  onSubmit: (event?: any) => Promise<void>;

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
      this.instance = null;
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

    observable.deep(this, 'state');
    observable.deep(this, 'data');
    observable.ref(this, 'params');
    observable.ref(this, 'instance');
    action.bound(this, 'setParams');
    action.bound(this, 'syncForm');

    this.instance = createFormControl<TFieldValues, any>(config);

    this.onSubmit = this.instance?.handleSubmit(
      this.handleSubmit.bind(this) as any,
      this.handleSubmitFailed.bind(this) as any,
    );

    /**
     *
     *
     * Subscribes
     *
     *
     */
    this.instance.subscribe({
      formState: dependsOn,
      callback: (formState) => this.syncForm(formState, formState.values),
    });

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

  protected syncForm(
    formState: Partial<FormState<TFieldValues>>,
    data?: DeepPartial<TFieldValues> | TFieldValues,
  ) {
    runInAction(() => {
      Object.assign(this.state, formState)
      if (this.data) {
        this.data = data as any;
      }
    });
  }

  onReset = () => {
    this.config.onReset?.();
  };

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

  destroy() {
    this.abortController.abort();
  }

  /**
   * @deprecated use destroy();
   */
  dispose(): void {
    this.destroy();
  }
}
