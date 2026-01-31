import { describe, expect, it, vi } from 'vitest';
import { createFormControl } from './rhf-compat';

describe('rhf-compat', () => {
  it('handles primitive default values', () => {
    const { getValues } = createFormControl({
      // intentional: cover non-object values
      defaultValues: 1 as any,
    });

    expect(getValues()).toBe(1);
  });

  it('extracts event values correctly', () => {
    const { register, getValues, control } = createFormControl({
      defaultValues: {},
    });
    const reg = register('flag');

    reg.onChange({ target: { checked: true } });
    expect(getValues('flag')).toBe(true);

    reg.onChange({ target: { value: 'yes' } });
    expect(getValues('flag')).toBe('yes');

    reg.onChange(123);
    expect(getValues('flag')).toBe(123);
    expect(control._formState.dirtyFields).toEqual({ flag: true });
  });

  it('handles empty paths and missing path traversal', () => {
    const { setValue, resetField, getValues } = createFormControl({
      defaultValues: { a: 1 },
    });

    setValue('' as any, 'noop');
    resetField('' as any);
    expect(getValues()).toEqual({ a: 1 });
    expect(getValues('missing.path' as any)).toBeUndefined();
  });

  it('returns event when target has no value', () => {
    const { register, getValues } = createFormControl({
      defaultValues: { name: '' },
    });
    const reg = register('name');
    const event = { target: { other: 1 } };

    reg.onChange(event);
    expect(getValues('name')).toStrictEqual(event);
  });

  it('returns event when target is not an object', () => {
    const { register, getValues } = createFormControl({
      defaultValues: { name: '' },
    });
    const reg = register('name');
    const event = { target: 1 };

    reg.onChange(event);
    expect(getValues('name')).toStrictEqual(event);
  });

  it('treats non-object errors as no errors', async () => {
    const { trigger, control } = createFormControl({
      defaultValues: { name: '' },
    });

    control._formState.errors = null as any;
    await expect(trigger()).resolves.toBe(true);
  });

  it('resets to defaults and respects keep options', () => {
    const { setValue, setError, reset, getValues, control } =
      createFormControl({
        defaultValues: { a: 1 },
      });

    setValue('a', 2, { shouldDirty: true, shouldTouch: true });
    setError('a', { type: 'required' });

    reset({});
    expect(getValues('a')).toBe(1);
    expect(control._formState.errors).toEqual({});
    expect(control._formState.dirtyFields).toEqual({});
    expect(control._formState.touchedFields).toEqual({});

    setError('a', { type: 'required' });
    reset({ a: 5 }, { keepErrors: true, keepDirty: true, keepTouched: true });
    expect(getValues('a')).toBe(5);
    expect(control._formState.errors).toHaveProperty('a');
  });

  it('resets to empty object when no defaultValues', () => {
    const { reset, getValues } = createFormControl({
      defaultValues: undefined,
    });

    reset({});
    expect(getValues()).toEqual({});
  });

  it('keeps submit flags when requested', () => {
    const { reset, control } = createFormControl({
      defaultValues: { name: 'ok' },
    });

    control._formState.isSubmitted = true;
    control._formState.isSubmitSuccessful = true;
    control._formState.submitCount = 2;

    reset({ name: 'next' }, { keepIsSubmitted: true });
    expect(control._formState.isSubmitted).toBe(true);
    expect(control._formState.isSubmitSuccessful).toBe(true);
    expect(control._formState.submitCount).toBe(2);
  });

  it('resets fields with defaultValue and keep flags', () => {
    const { setValue, setError, resetField, control, register } =
      createFormControl({
        defaultValues: { a: 1 },
      });

    const reg = register('a');
    reg.onChange({ target: { value: 2 } });
    reg.onBlur();
    setError('a', { type: 'required' });

    resetField('a', { defaultValue: 5 });
    expect(control.getValues('a')).toBe(5);
    expect(control._formState.errors).toEqual({});
    expect(control._formState.dirtyFields).toEqual({});
    expect(control._formState.touchedFields).toEqual({});

    setValue('a', 6, { shouldDirty: true, shouldTouch: true });
    setError('a', { type: 'required' });
    resetField('a', { keepDirty: true, keepTouched: true, keepError: true });
    expect(control._formState.errors).toHaveProperty('a');
    expect(control._formState.dirtyFields).toHaveProperty('a');
    expect(control._formState.touchedFields).toHaveProperty('a');
  });

  it('unregister respects keep options', () => {
    const { setValue, setError, unregister, control, register } =
      createFormControl({
        defaultValues: { a: 1 },
      });

    register('a').onBlur();
    setValue('a', 2, { shouldDirty: true, shouldTouch: true });
    setError('a', { type: 'required' });

    unregister('a', {
      keepValue: true,
      keepDirty: true,
      keepTouched: true,
      keepError: true,
    });
    expect(control.getValues('a')).toBe(2);
    expect(control._formState.errors).toHaveProperty('a');

    unregister('a');
    expect(control.getValues('a')).toBeUndefined();
    expect(control._formState.errors).toEqual({});
  });

  it('unregister supports array of names', () => {
    const { unregister, setError, control } = createFormControl({
      defaultValues: { a: 1, b: 2 },
    });

    setError('a', { type: 'required' });
    setError('b', { type: 'required' });
    unregister(['a', 'b']);
    expect(control._formState.errors).toEqual({});
  });

  it('unregister handles empty input', () => {
    const { unregister } = createFormControl({
      defaultValues: { a: 1 },
    });

    expect(() => unregister()).not.toThrow();
  });

  it('clears errors by path and fully', () => {
    const { setError, clearErrors, control } = createFormControl({
      defaultValues: {},
    });

    setError('items.0', { type: 'required' });
    setError('name', { type: 'required' });

    clearErrors('items.0');
    expect(Array.isArray(control._formState.errors.items)).toBe(true);
    expect(control._formState.errors.items?.[0]).toBeUndefined();

    clearErrors();
    expect(control._formState.errors).toEqual({});
  });

  it('clears errors for multiple fields', () => {
    const { setError, clearErrors, control } = createFormControl({
      defaultValues: { a: 1, b: 2 },
    });

    setError('a', { type: 'required' });
    setError('b', { type: 'required' });

    clearErrors(['a', 'b']);
    expect(control._formState.errors).toEqual({});
  });

  it('gets values by array of paths', () => {
    const { getValues } = createFormControl({
      defaultValues: { a: 1, b: 2 },
    });

    expect(getValues(['a', 'b'])).toEqual([1, 2]);
  });

  it('sets focus and selects when requested', () => {
    const { register, setFocus } = createFormControl({
      defaultValues: { name: '' },
    });
    const focus = vi.fn();
    const select = vi.fn();
    register('name').ref({ focus, select });

    setFocus('name');
    expect(focus).toHaveBeenCalledTimes(1);

    setFocus('name', { shouldSelect: true });
    expect(focus).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('focuses field on setError with shouldFocus', () => {
    const { register, setError } = createFormControl({
      defaultValues: { name: '' },
    });
    const focus = vi.fn();
    register('name').ref({ focus });

    setError('name', { type: 'required' }, { shouldFocus: true });
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('triggers validation and handleSubmit paths', async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();

    const { handleSubmit, setValue, trigger } = createFormControl({
      defaultValues: { name: '' },
      resolver: (values) => {
        if (!values.name) {
          return { values, errors: { name: { type: 'required' } } };
        }
        return { values: { name: 'resolved' }, errors: {} };
      },
    });

    await trigger();
    await handleSubmit(onValid, onInvalid)();
    expect(onInvalid).toHaveBeenCalled();

    setValue('name', 'ok', { shouldValidate: true });
    await handleSubmit(onValid, onInvalid)();
    expect(onValid).toHaveBeenCalledWith(
      { name: 'resolved' },
      undefined,
    );
  });

  it('uses current values when resolver returns undefined values', async () => {
    const onValid = vi.fn();
    const { handleSubmit, setValue } = createFormControl({
      defaultValues: { name: 'init' },
      resolver: () => ({ values: undefined as any, errors: undefined as any }),
    });

    setValue('name', 'current');
    await handleSubmit(onValid)();
    expect(onValid).toHaveBeenCalledWith({ name: 'current' }, undefined);
  });

  it('handleSubmit uses raw values without resolver', async () => {
    const onValid = vi.fn();
    const { handleSubmit, setValue } = createFormControl({
      defaultValues: { name: 'init' },
    });

    setValue('name', 'plain');
    await handleSubmit(onValid)();
    expect(onValid).toHaveBeenCalledWith({ name: 'plain' }, undefined);
  });

  it('handleSubmit calls onInvalid when errors exist', async () => {
    const onInvalid = vi.fn();
    const { handleSubmit, setError } = createFormControl({
      defaultValues: { name: '' },
    });

    setError('name', { type: 'required' });
    await handleSubmit(vi.fn(), onInvalid)();
    expect(onInvalid).toHaveBeenCalled();
  });

  it('handleSubmit ignores invalid when onInvalid missing', async () => {
    const onValid = vi.fn();
    const { handleSubmit, setError } = createFormControl({
      defaultValues: { name: '' },
    });

    setError('name', { type: 'required' });
    await handleSubmit(onValid)();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('handleSubmit propagates errors from onValid', async () => {
    const onValid = vi.fn(() => {
      throw new Error('fail');
    });
    const { handleSubmit, setValue } = createFormControl({
      defaultValues: { name: 'ok' },
      resolver: (values) => ({ values, errors: {} }),
    });

    setValue('name', 'ok');
    await expect(handleSubmit(onValid)()).rejects.toThrow('fail');
  });

  it('exposes field state', () => {
    const { register, setError, control } = createFormControl({
      defaultValues: { name: '' },
    });

    register('name').onBlur();
    setError('name', { type: 'required' });

    const state = control.getFieldState('name');
    expect(state.invalid).toBe(true);
    expect(state.isTouched).toBe(true);
  });

  it('ignores ref assignment when field is missing', () => {
    const { register, control } = createFormControl({
      defaultValues: { name: '' },
    });
    const reg = register('name');

    control._fields.delete('name');
    expect(() => reg.ref({})).not.toThrow();
  });

  it('supports subscriptions', () => {
    const { subscribe, setValue } = createFormControl({
      defaultValues: { a: 1 },
    });

    const spy = vi.fn();
    const unsubscribe = subscribe({ callback: spy });

    setValue('a', 2);
    expect(spy).toHaveBeenCalled();

    unsubscribe();
    setValue('a', 3);
  });

  it('marks isValid on change when previously false', () => {
    const { register, control } = createFormControl({
      defaultValues: { name: '' },
    });
    const reg = register('name');

    control._formState.isValid = false;
    reg.onChange({ target: { value: 'ok' } });

    expect(control._formState.isValid).toBe(true);
  });

  it('calls preventDefault in handleSubmit', async () => {
    const onValid = vi.fn();
    const { handleSubmit } = createFormControl({
      defaultValues: { name: 'ok' },
    });
    const event = { preventDefault: vi.fn() };

    await handleSubmit(onValid)(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
