/**
 * @vitest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createFormControl } from '../form/rhf-compat';
import { Controller } from './controller';

describe('Controller', () => {
  it('renders field and keeps control in sync', () => {
    const { control } = createFormControl({
      defaultValues: {},
    });

    const renderSpy = vi.fn(({ field }) => (
      <input
        data-testid="input"
        type="checkbox"
        checked={Boolean(field.value)}
        onChange={field.onChange}
        onBlur={field.onBlur}
        ref={field.ref}
      />
    ));

    const { getByTestId, unmount } = render(
      <Controller
        control={control}
        name={'name'}
        defaultValue={true}
        render={renderSpy}
      />,
    );

    const input = getByTestId('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(control.getValues('name')).toBe(true);

    const lastRender = renderSpy.mock.calls[renderSpy.mock.calls.length - 1][0];
    act(() => {
      lastRender.field.onChange({ target: { checked: false } });
    });
    expect(control.getValues('name')).toBe(false);

    act(() => {
      lastRender.field.onBlur();
    });
    expect(control._formState.touchedFields).toEqual({ name: true });

    unmount();
    expect(renderSpy).toHaveBeenCalled();
  });
});
