import { action, observable, runInAction, toJS } from 'mobx';

export type FieldValues = Record<string, any>;

export type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type DeepMap<T, TValue> = T extends Array<infer U>
  ? Array<DeepMap<U, TValue>>
  : T extends object
    ? { [K in keyof T]?: DeepMap<T[K], TValue> }
    : TValue;

export type DefaultValues<TFieldValues extends FieldValues> =
  DeepPartial<TFieldValues>;

export type FieldPath<_TFieldValues extends FieldValues> = string;

export type FieldPathValue<
  TFieldValues extends FieldValues,
  _TFieldPath extends FieldPath<TFieldValues>,
> = any;

export interface FieldError {
  type: any;
  message?: any;
  ref?: any;
  types?: Record<string, any>;
}

export type FieldErrors<TFieldValues extends FieldValues> = Partial<
  DeepMap<DeepPartial<TFieldValues>, FieldError>
>;

export interface FormState<TFieldValues extends FieldValues> {
  isDirty: boolean;
  isLoading: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  disabled: boolean;
  submitCount: number;
  dirtyFields: Partial<DeepMap<DeepPartial<TFieldValues>, boolean>>;
  touchedFields: Partial<DeepMap<DeepPartial<TFieldValues>, boolean>>;
  validatingFields: Partial<DeepMap<DeepPartial<TFieldValues>, boolean>>;
  errors: FieldErrors<TFieldValues>;
}

export interface SetValueConfig {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
}

export interface UseFormRegisterReturn {
  onChange: (event: any) => void;
  onBlur: (event?: any) => void;
  name: string;
  ref: (instance: any | null) => void;
}

export type UseFormRegister<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: any,
) => UseFormRegisterReturn;

export type UseFormSetError<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  error: FieldError,
  options?: { shouldFocus?: boolean },
) => void;

export type UseFormClearErrors<TFieldValues extends FieldValues> = (
  name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
) => void;

export type UseFormTrigger<TFieldValues extends FieldValues> = (
  name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  options?: { shouldFocus?: boolean },
) => Promise<boolean>;

export type UseFormResetField<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: {
    keepDirty?: boolean;
    keepTouched?: boolean;
    keepError?: boolean;
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  },
) => void;

export type UseFormUnregister<TFieldValues extends FieldValues> = (
  name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  options?: {
    keepDirty?: boolean;
    keepTouched?: boolean;
    keepValue?: boolean;
    keepError?: boolean;
    keepIsValid?: boolean;
    keepDefaultValue?: boolean;
  },
) => void;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  options?: { shouldSelect?: boolean },
) => void;

export type UseFormSetValue<TFieldValues extends FieldValues> = <
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  name: TFieldName,
  value: FieldPathValue<TFieldValues, TFieldName>,
  options?: SetValueConfig,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  (): TFieldValues;
  <TFieldName extends FieldPath<TFieldValues>>(
    name: TFieldName,
  ): FieldPathValue<TFieldValues, TFieldName>;
  <TFieldName extends FieldPath<TFieldValues>>(
    names: TFieldName[],
  ): FieldPathValue<TFieldValues, TFieldName>[];
};

export type UseFormReset<TFieldValues extends FieldValues> = (
  values?: DefaultValues<TFieldValues>,
  options?: {
    keepErrors?: boolean;
    keepDirty?: boolean;
    keepTouched?: boolean;
    keepIsSubmitted?: boolean;
  },
) => void;

export type SubmitHandler<TFieldValues extends FieldValues> = (
  values: TFieldValues,
  event?: any,
) => void | Promise<void>;

export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
  errors: FieldErrors<TFieldValues>,
  event?: any,
) => void | Promise<void>;

export type UseFormHandleSubmit<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues = TFieldValues,
> = (
  onValid: SubmitHandler<TTransformedValues>,
  onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (event?: any) => Promise<void>;

export interface ResolverResult<TFieldValues extends FieldValues> {
  values: TFieldValues;
  errors: FieldErrors<TFieldValues>;
}

export type Resolver<TFieldValues extends FieldValues, TContext = any> = (
  values: TFieldValues,
  context: TContext | undefined,
  options?: any,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;

export interface UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  _TTransformedValues extends FieldValues = TFieldValues,
> {
  defaultValues?: DefaultValues<TFieldValues>;
  values?: DefaultValues<TFieldValues>;
  resolver?: Resolver<TFieldValues, TContext>;
  context?: TContext;
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  shouldFocusError?: boolean;
  shouldUnregister?: boolean;
  criteriaMode?: 'firstError' | 'all';
  delayError?: number;
  disabled?: boolean;
}

export interface Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues,
> {
  _options: UseFormProps<TFieldValues, TContext, TTransformedValues>;
  _formValues: TFieldValues;
  _formState: FormState<TFieldValues>;
  _fields: Map<string, { ref?: any }>;
  register: UseFormRegister<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  resetField: UseFormResetField<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues>;
  subscribe: (options: {
    formState?: Partial<
      Record<keyof FormState<TFieldValues> | 'values', boolean>
    >;
    callback: (
      state: Partial<FormState<TFieldValues>> & { values?: TFieldValues },
    ) => void;
  }) => () => void;
  getFieldState: (name: FieldPath<TFieldValues>) => {
    error?: FieldError;
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
  };
}

const cloneDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item)) as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([key, val]) => {
      result[key] = cloneDeep(val);
    });
    return result as T;
  }
  return value;
};

const makeObservableValue = <T>(value: T): T => {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return observable(value as any) as T;
  }
  return value;
};

const parsePath = (path: string): Array<string | number> => {
  if (!path) return [];
  return path.split('.').map((part) => {
    if (/^\d+$/.test(part)) {
      return Number(part);
    }
    return part;
  });
};

const getValueAtPath = (obj: any, path: string) => {
  const parts = parsePath(path);
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part as any];
  }
  return current;
};

const setValueAtPath = (obj: any, path: string, value: any) => {
  const parts = parsePath(path);
  if (parts.length === 0) return;
  let current = obj;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part as any] = value;
      return;
    }
    const nextPart = parts[index + 1];
    if (current[part as any] == null) {
      current[part as any] = typeof nextPart === 'number' ? [] : {};
    }
    current = current[part as any];
  });
};

const removeValueAtPath = (obj: any, path: string) => {
  const parts = parsePath(path);
  if (parts.length === 0) return;
  let current = obj;
  parts.forEach((part, index) => {
    if (current == null) return;
    if (index === parts.length - 1) {
      if (Array.isArray(current) && typeof part === 'number') {
        current[part] = undefined;
      } else {
        delete current[part as any];
      }
      return;
    }
    current = current[part as any];
  });
};

const hasErrors = (errors: FieldErrors<any>) => {
  if (!errors || typeof errors !== 'object') return false;
  return Object.keys(errors).length > 0;
};

const getEventValue = (event: any) => {
  if (event && typeof event === 'object' && 'target' in event) {
    const target = (event as any).target;
    if (target && typeof target === 'object') {
      if ('checked' in target && typeof target.checked === 'boolean') {
        return target.checked;
      }
      if ('value' in target) {
        return target.value;
      }
    }
  }
  return event;
};

export const createFormControl = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues,
>(
  config: UseFormProps<TFieldValues, TContext, TTransformedValues>,
) => {
  const initialValues = cloneDeep(
    (config.values ?? config.defaultValues ?? {}) as TFieldValues,
  );

  const formState: FormState<TFieldValues> = observable({
    isDirty: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isSubmitting: false,
    isValidating: false,
    isValid: false,
    disabled: config.disabled ?? false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: {},
  });

  let values = makeObservableValue(initialValues);
  const subscribers = new Set<{
    formState?: Partial<
      Record<keyof FormState<TFieldValues> | 'values', boolean>
    >;
    callback: (
      state: Partial<FormState<TFieldValues>> & { values?: TFieldValues },
    ) => void;
  }>();

  const fields = new Map<string, { ref?: any }>();

  const notify = () => {
    const state = {
      ...(toJS(formState) as FormState<TFieldValues>),
      values: toJS(values) as TFieldValues,
    };
    for (const subscriber of subscribers) {
      subscriber.callback(state);
    }
  };

  const setDirtyFlag = action((name: string, value: boolean) => {
    setValueAtPath(formState.dirtyFields, name, value);
  });

  const setTouchedFlag = action((name: string, value: boolean) => {
    setValueAtPath(formState.touchedFields, name, value);
  });

  const setError: UseFormSetError<TFieldValues> = action(
    (name, error, options) => {
      const nextErrors = cloneDeep(formState.errors);
      const normalizedError: FieldError = { ...error };
      setValueAtPath(nextErrors, name, normalizedError);
      formState.errors = nextErrors;
      formState.isValid = false;
      if (options?.shouldFocus) {
        setFocus(name);
      }
      notify();
    },
  );

  const clearErrors: UseFormClearErrors<TFieldValues> = action((name) => {
    if (!name) {
      formState.errors = {};
      notify();
      return;
    }
    const names = Array.isArray(name) ? name : [name];
    const nextErrors = cloneDeep(formState.errors);
    for (const path of names) {
      removeValueAtPath(nextErrors, path);
    }
    formState.errors = nextErrors;
    notify();
  });

  const getValues: UseFormGetValues<TFieldValues> = (name?: any) => {
    const rawValues = toJS(values) as TFieldValues;
    if (!name) {
      return rawValues;
    }
    if (Array.isArray(name)) {
      return name.map((path) => getValueAtPath(rawValues, path));
    }
    return getValueAtPath(rawValues, name);
  };

  const setValue: UseFormSetValue<TFieldValues> = action(
    (name, value, options) => {
      setValueAtPath(values, name, value);
      if (options?.shouldDirty) {
        setDirtyFlag(name, true);
      }
      if (options?.shouldTouch) {
        setTouchedFlag(name, true);
      }
      if (options?.shouldValidate) {
        void trigger(name);
      }
      notify();
    },
  );

  const reset: UseFormReset<TFieldValues> = action((nextValues, options) => {
    const shouldResetToDefault =
      !nextValues ||
      (typeof nextValues === 'object' &&
        nextValues != null &&
        Object.keys(nextValues).length === 0);
    values = makeObservableValue(
      cloneDeep(
        (shouldResetToDefault
          ? (config.defaultValues ?? {})
          : nextValues) as TFieldValues,
      ),
    );
    control._formValues = values;

    if (!options?.keepErrors) {
      formState.errors = {};
    }
    if (!options?.keepDirty) {
      formState.dirtyFields = {};
    }
    if (!options?.keepTouched) {
      formState.touchedFields = {};
    }
    if (!options?.keepIsSubmitted) {
      formState.isSubmitted = false;
      formState.isSubmitSuccessful = false;
      formState.submitCount = 0;
    }
    notify();
  });

  const resetField: UseFormResetField<TFieldValues> = action(
    (name, options = {}) => {
      if (options.defaultValue !== undefined) {
        setValueAtPath(values, name, options.defaultValue);
      }
      if (!options.keepDirty) {
        removeValueAtPath(formState.dirtyFields, name);
      }
      if (!options.keepTouched) {
        removeValueAtPath(formState.touchedFields, name);
      }
      if (!options.keepError) {
        removeValueAtPath(formState.errors, name);
      }
      notify();
    },
  );

  const unregister: UseFormUnregister<TFieldValues> = action(
    (name, options) => {
      if (!name) return;
      const names = Array.isArray(name) ? name : [name];
      for (const path of names) {
        if (!options?.keepValue) {
          removeValueAtPath(values, path);
        }
        if (!options?.keepDirty) {
          removeValueAtPath(formState.dirtyFields, path);
        }
        if (!options?.keepTouched) {
          removeValueAtPath(formState.touchedFields, path);
        }
        if (!options?.keepError) {
          removeValueAtPath(formState.errors, path);
        }
      }
      notify();
    },
  );

  const setFocus: UseFormSetFocus<TFieldValues> = (name, options) => {
    const field = fields.get(String(name));
    const element = field?.ref;
    if (element && typeof element.focus === 'function') {
      element.focus();
      if (options?.shouldSelect && typeof element.select === 'function') {
        element.select();
      }
    }
  };

  let lastResolvedValues: TTransformedValues | null = null;

  const trigger: UseFormTrigger<TFieldValues> = async () => {
    if (config.resolver) {
      const result = await config.resolver(values, config.context, {});
      runInAction(() => {
        formState.errors = result.errors ?? {};
        lastResolvedValues = (result.values ??
          values) as unknown as TTransformedValues;
        formState.isValid = !hasErrors(formState.errors);
      });
    }
    const valid = !hasErrors(formState.errors);
    notify();
    return valid;
  };

  const register: UseFormRegister<TFieldValues> = (name) => {
    const fieldName = String(name);
    const wasRegistered = fields.has(fieldName);
    if (!wasRegistered) {
      fields.set(fieldName, {});
    }
    let shouldNotify = !wasRegistered;
    if (!hasErrors(formState.errors) && formState.isValid === false) {
      runInAction(() => {
        formState.isValid = true;
      });
      shouldNotify = true;
    }
    if (shouldNotify) {
      notify();
    }
    return {
      name: fieldName,
      onChange: (event: any) => {
        setValue(fieldName as any, getEventValue(event), {
          shouldDirty: true,
        });
        if (formState.isValid === false) {
          runInAction(() => {
            formState.isValid = true;
          });
        }
      },
      onBlur: () => {
        runInAction(() => {
          setTouchedFlag(fieldName, true);
        });
        notify();
      },
      ref: (instance: any | null) => {
        const entry = fields.get(fieldName);
        if (entry) {
          entry.ref = instance ?? undefined;
        }
      },
    };
  };

  const handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues> = (
    onValid,
    onInvalid,
  ) => {
    return async (event) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      runInAction(() => {
        formState.isSubmitting = true;
      });
      notify();
      const isValid = await trigger();
      runInAction(() => {
        formState.isSubmitted = true;
        formState.submitCount += 1;
      });
      if (isValid) {
        try {
          const submitValues =
            lastResolvedValues ?? (values as unknown as TTransformedValues);
          await onValid(submitValues, event);
          runInAction(() => {
            formState.isSubmitSuccessful = true;
          });
        } catch (error) {
          runInAction(() => {
            formState.isSubmitSuccessful = false;
            formState.isSubmitting = false;
          });
          notify();
          throw error;
        }
      } else if (onInvalid) {
        await onInvalid(formState.errors, event);
      }
      runInAction(() => {
        formState.isSubmitting = false;
      });
      notify();
    };
  };

  const subscribe: Control<TFieldValues>['subscribe'] = ({
    formState: _formState,
    callback,
  }) => {
    const entry = { formState: _formState, callback };
    subscribers.add(entry);
    return () => {
      subscribers.delete(entry);
    };
  };

  const getFieldState: Control<TFieldValues>['getFieldState'] = (name) => {
    const error = getValueAtPath(formState.errors, String(name));
    const isTouched = Boolean(
      getValueAtPath(formState.touchedFields, String(name)),
    );
    const isDirty = Boolean(
      getValueAtPath(formState.dirtyFields, String(name)),
    );
    return {
      error,
      invalid: Boolean(error),
      isTouched,
      isDirty,
    };
  };

  const control: Control<TFieldValues, TContext, TTransformedValues> = {
    _options: config,
    _formValues: values,
    _formState: formState,
    _fields: fields,
    register,
    setValue,
    getValues,
    setError,
    clearErrors,
    trigger,
    resetField,
    unregister,
    setFocus,
    reset,
    handleSubmit,
    subscribe,
    getFieldState,
  };

  return {
    control,
    register,
    setValue,
    getValues,
    setError,
    clearErrors,
    trigger,
    resetField,
    unregister,
    setFocus,
    reset,
    handleSubmit,
    subscribe,
  };
};
