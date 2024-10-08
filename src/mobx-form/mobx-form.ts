import { Disposable, Disposer, IDisposer } from 'disposer-util';
import noop from 'lodash-es/noop';
import { makeObservable, observable, runInAction } from 'mobx';
import { FormState, UseFormProps, UseFormReturn } from 'react-hook-form';
import { AnyObject } from 'yammies/utils/types';

import { ConnectedMobxForm, MobxFormParams } from './mobx-form.types';

export class MobxForm<TFieldValues extends AnyObject, TContext = any>
  implements Disposable
{
  disposer: IDisposer;

  protected RHFParams: UseFormProps<TFieldValues, TContext>;

  protected submitHandler?: MobxFormParams<TFieldValues, TContext>['onSubmit'];
  protected submitErrorHandler?: MobxFormParams<
    TFieldValues,
    TContext
  >['onSubmitFailed'];
  protected resetHandler?: MobxFormParams<TFieldValues, TContext>['onReset'];

  state: FormState<TFieldValues>;

  constructor({
    disposer,
    onSubmit,
    onSubmitFailed,
    onReset,
    ...RHFParams
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
    this.RHFParams = RHFParams;

    makeObservable(this, {
      state: observable.deep,
    });
  }

  getRHFParams() {
    return this.RHFParams;
  }

  connectRHF(
    formResult: UseFormReturn<TFieldValues, TContext>,
  ): ConnectedMobxForm<TFieldValues, TContext> {
    runInAction(() => {
      this.state = formResult.formState;
    });

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
  }
}
