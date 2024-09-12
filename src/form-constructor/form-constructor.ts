import {
  FormBuildConfig,
  FormConstructorConfig,
} from './form-constructor.types';
import { MobxForm } from './mobx-form';

export class FormConstructor<C extends FormConstructorConfig> {
  private constructor(protected config: C) {}

  static create<C extends FormConstructorConfig>(config: C) {
    return new FormConstructor(config);
  }

  build<FormStruct extends AnyObject>(config: FormBuildConfig<FormStruct, C>) {
    const form = new MobxForm(config);
    return form;
  }
}
