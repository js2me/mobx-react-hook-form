import { Disposable, Disposer, IDisposer } from 'disposer-util';
import noop from 'lodash-es/noop';
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { FormState, UseFormProps, UseFormReturn } from 'react-hook-form';
import { AnyObject, Maybe } from 'yammies/utils/types';

import { ConnectedMobxForm, MobxFormParams } from './mobx-form.types';

export class MobxForm<TFieldValues extends AnyObject, TContext = any>
  implements Disposable
{
  protected disposer: IDisposer;

  /**
   * Readl react-hook-form params
   * Needed to connect real react-hook-form to this mobx wrapper
   */
  params: UseFormProps<TFieldValues, TContext>;

  protected submitHandler?: MobxFormParams<TFieldValues, TContext>['onSubmit'];
  protected submitErrorHandler?: MobxFormParams<
    TFieldValues,
    TContext
  >['onSubmitFailed'];
  protected resetHandler?: MobxFormParams<TFieldValues, TContext>['onReset'];

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

  constructor({
    disposer,
    onSubmit,
    onSubmitFailed,
    onReset,
    getParams,
    ...params
  }: MobxFormParams<TFieldValues, TContext>) {
    this.disposer = disposer ?? new Disposer();

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
    this.submitHandler = onSubmit;
    this.submitErrorHandler = onSubmitFailed;
    this.resetHandler = onReset;
    this.params = params;

    makeObservable<this, 'params'>(this, {
      state: observable.deep,
      data: observable.deep,
      params: observable.ref,
      setParams: action.bound,
      updateParams: action.bound,
    });

    if (getParams) {
      this.disposer.add(
        reaction(getParams, (params) => this.updateParams(params)),
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

      this.disposer.add(
        formResult.watch(() => {
          runInAction(() => {
            this.form = formResult;
            this.state = formResult.formState;
            this.data = formResult.getValues();
          });
        }).unsubscribe,
      );
    }

    return {
      ...formResult,
      onReset: this.resetHandler ?? noop,
      onSubmit: formResult.handleSubmit(
        this.submitHandler ?? noop,
        this.submitErrorHandler,
      ),
    };
  }

  dispose(): void {
    this.disposer.dispose();

    this.form = null;
    this.data = null;
  }
}
