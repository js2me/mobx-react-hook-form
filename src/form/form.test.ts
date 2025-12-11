import { describe, expect, it } from 'vitest';
import { sleep } from 'yummies/async';
import { createForm } from './form';

describe('form', () => {
  it('changeValue should update form.values', async () => {
    const form = createForm({
      defaultValues: {
        foo: 1,
        bar: 2,
      },
    });

    form.changeField('foo', 4);

    expect(form.values).toEqual({ foo: 4, bar: 2 });

    await sleep();

    expect(form.values).toEqual({ foo: 4, bar: 2 });
  });
});
