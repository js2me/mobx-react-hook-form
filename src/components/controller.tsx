import { Observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import type {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  FormState,
} from '../form/rhf-compat.js';

export interface ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  field: {
    name: TName;
    value: FieldPathValue<TFieldValues, TName>;
    onChange: (event: any) => void;
    onBlur: (event?: any) => void;
    ref: (instance: any | null) => void;
  };
  fieldState: {
    error?: any;
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
  };
  formState: FormState<TFieldValues>;
}

export interface ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  disabled?: boolean;
  shouldUnregister?: boolean;
  rules?: any;
  render: (props: ControllerRenderProps<TFieldValues, TName>) => JSX.Element;
}

export function Controller<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  const { control, name, defaultValue } = props;
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return control.subscribe({
      callback: () => {
        forceUpdate((prev) => (prev + 1) % 1000000);
      },
    });
  }, [control]);

  const currentValue = control.getValues(name);
  const resolvedValue =
    currentValue ?? (defaultValue as FieldPathValue<TFieldValues, TName>);

  if (currentValue === undefined && defaultValue !== undefined) {
    control.setValue(name, defaultValue);
  }

  const registration = control.register(name);
  const fieldState = control.getFieldState(name);

  return (
    <Observer>
      {() =>
        props.render({
          field: {
            name,
            value: resolvedValue,
            onChange: registration.onChange,
            onBlur: registration.onBlur,
            ref: registration.ref,
          },
          fieldState,
          formState: control._formState,
        })
      }
    </Observer>
  );
}
