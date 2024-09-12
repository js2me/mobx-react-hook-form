import { action, observable } from 'mobx';
import { Disposable, Disposer } from 'mobx-disposer-util';
import { generateId } from 'yammies/id';

import {
  FormBuildConfig,
  FormConstructorConfig,
} from './form-constructor.types';

export class MobxForm<
  FormData extends AnyObject,
  C extends FormConstructorConfig,
> implements Disposable
{
  id: string;

  private disposer: Disposer;

  @observable
  accessor error: unknown;

  @observable
  accessor isLoading = false;

  @observable
  accessor isReadOnly = false;

  @observable
  accessor isDisabled = false;

  constructor(private buildConfig: FormBuildConfig<FormData, C>) {
    this.id = buildConfig.id ?? generateId();
    this.disposer = buildConfig.disposer ?? new Disposer();
  }

  @action
  setDisabled = (isDisabled: boolean) => {
    this.isDisabled = isDisabled;
  };

  @action
  setReadOnly = (isReadOnly: boolean) => {
    this.isReadOnly = isReadOnly;
  };

  @action
  setLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  @action
  setError = (error: unknown) => {
    this.error = error;
  };

  @action
  handleSubmit = async (formData: FormData) => {
    this.setLoading(true);
    this.setDisabled(true);

    try {
      await this.buildConfig.onSubmit(formData);
    } catch (e) {
      this.setError(e);
      this.buildConfig.onSubmitFailure?.(e, formData);
    }

    this.setLoading(false);
    this.setDisabled(false);
  };

  dispose() {
    this.disposer.dispose();
  }
}
