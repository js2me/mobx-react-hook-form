/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { action, makeObservable, observable } from 'mobx';
import {
  DeepMap,
  DeepPartial,
  FieldErrors,
  FieldValues,
  FormState,
} from 'react-hook-form';

type FormValues<TFieldValues extends FieldValues> = {
  values: TFieldValues;
};

type MobxFormStateUpdate<TFieldValues extends FieldValues> = Omit<
  Partial<MobxFormState<TFieldValues>>,
  'update'
>;

export type MobxFormStateReadonly<TFieldValues extends FieldValues> = Readonly<
  Omit<MobxFormState<TFieldValues>, 'update'>
>;

export class MobxFormState<TFieldValues extends FieldValues = FieldValues>
  implements FormState<TFieldValues>, FormValues<TFieldValues>
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

  constructor(initialState?: MobxFormStateUpdate<TFieldValues>) {
    if (initialState) {
      Object.assign(this, initialState);
    }

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
    action(this, 'update');

    makeObservable(this);
  }

  update({
    values,
    errors,
    ...simpleProperties
  }: MobxFormStateUpdate<TFieldValues>) {
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
          // @ts-ignore
          Object.assign(this.errors[errorField], errors[errorField]);
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
}
