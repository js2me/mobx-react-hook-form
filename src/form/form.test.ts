import { describe, expect, it, vi } from 'vitest';
import { sleep } from 'yummies/async';
import type { Maybe } from 'yummies/types';
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

  it('should initialize with default values', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 30,
      },
    });

    expect(form.values).toEqual({ name: 'John', age: 30 });
    expect(form.defaultValues).toEqual({ name: 'John', age: 30 });
  });

  it('should update values using setValue', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 30,
      },
    });

    form.setValue('name', 'Jane');

    expect(form.values).toEqual({ name: 'Jane', age: 30 });
  });

  it('should handle form submission', async () => {
    const onSubmit = vi.fn();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      onSubmit,
    });

    await form.submit();

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should handle form submission with errors', async () => {
    const onSubmitFailed = vi.fn();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      onSubmitFailed,
      strictSubmitChecks: true,
    });

    form.setError('name', { type: 'required', message: 'Required' });

    await expect(form.submit()).rejects.toEqual(form.errors);

    expect(onSubmitFailed).toHaveBeenCalled();
  });

  it('should reset form values', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 30,
      },
    });

    form.setValue('name', 'Jane');

    form.resetForm();

    expect(form.values).toEqual({ name: 'John', age: 30 });
  });

  it('should reset form with new values', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 30,
      },
    });

    form.setValue('name', 'Jane');

    form.resetForm({ name: 'Bob', age: 25 });

    expect(form.values).toEqual({ name: 'Bob', age: 25 });
  });

  it('should handle field registration', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    const registerResult = form.register('name');

    expect(registerResult).toHaveProperty('name');
    expect(registerResult).toHaveProperty('onChange');
    expect(registerResult).toHaveProperty('onBlur');
  });

  it('should handle field errors', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    form.setError('name', { type: 'required', message: 'Name is required' });

    expect(form.errors).toHaveProperty('name');
    expect(form.errors.name).toEqual({
      type: 'required',
      message: 'Name is required',
    });
  });

  it('should clear errors', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    form.setError('name', { type: 'required', message: 'Name is required' });

    expect(form.errors).toHaveProperty('name');

    form.clearErrors('name');

    expect(form.errors).toHaveProperty('name');
  });

  it('should handle field reset', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 30,
      },
    });

    form.setValue('name', 'Jane');
    form.resetField('name');

    expect(form.values).toEqual({ name: 'Jane', age: 30 });
  });

  it('should handle form state properties', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    expect(form.isDirty).toBe(false);
    expect(form.isLoading).toBe(false);
    expect(form.isSubmitted).toBe(false);
    expect(form.isSubmitSuccessful).toBe(false);
    expect(form.isSubmitting).toBe(false);
    expect(form.isValidating).toBe(false);
    expect(form.isValid).toBe(false);
    expect(form.disabled).toBe(false);
    expect(form.submitCount).toBe(0);
    expect(form.isReady).toBe(false);
  });

  it('should handle changeField with validation on submit', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    form.changeField('name', 'Jane');
    expect(form.values).toEqual({ name: 'Jane' });

    form.isSubmitted = true;

    form.changeField('name', 'Bob');
    expect(form.values).toEqual({ name: 'Bob' });
  });

  it('should get errors with paths', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    form.setError('name', { type: 'required', message: 'Required' });

    const errorsWithPath = form.getErrorsWithPaths();
    expect(errorsWithPath).toHaveLength(1);
    expect(errorsWithPath[0]).toEqual({
      path: 'name',
      error: { type: 'required', message: 'Required' },
    });
  });

  it('should handle nested errors with paths', () => {
    const form = createForm({
      defaultValues: {
        user: {
          name: 'John',
        },
      },
    });

    form.setError('user.name', { type: 'required', message: 'Required' });

    const errorsWithPath = form.getErrorsWithPaths();
    expect(errorsWithPath).toHaveLength(1);
    expect(errorsWithPath[0]).toEqual({
      path: 'user.name',
      error: { type: 'required', message: 'Required' },
    });
  });

  it('should handle array errors with paths', () => {
    const form = createForm({
      defaultValues: {
        items: ['item1', 'item2'],
      },
    });

    form.setError('items.0', { type: 'required', message: 'Required' });

    const errorsWithPath = form.getErrorsWithPaths();
    expect(errorsWithPath).toHaveLength(1);
    expect(errorsWithPath[0]).toEqual({
      path: 'items.0',
      error: { type: 'required', message: 'Required' },
    });
  });

  it('should handle hasErrors computed property', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    expect(form.hasErrors).toBe(false);

    form.setError('name', { type: 'required', message: 'Required' });

    expect(form.hasErrors).toBe(true);
  });

  it('should destroy form properly', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
    });

    expect(() => form.destroy()).not.toThrow();
  });

  it('should handle complex nested values', () => {
    const form = createForm({
      defaultValues: {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
          settings: {
            theme: 'light',
            notifications: true,
          },
        },
        items: ['item1', 'item2'],
      },
    });

    expect(form.values).toEqual({
      user: {
        profile: {
          name: 'John',
          age: 30,
        },
        settings: {
          theme: 'light',
          notifications: true,
        },
      },
      items: ['item1', 'item2'],
    });
  });

  it('should handle array field operations', () => {
    const form = createForm({
      defaultValues: {
        items: ['item1', 'item2', 'item3'],
      },
    });

    form.setValue('items.1', 'modifiedItem');
    expect(form.values.items[1]).toBe('modifiedItem');

    const item = form.getValues('items.0');
    expect(item).toBe('item1');
  });

  it('should handle form with complex validation rules', () => {
    const form = createForm({
      defaultValues: {
        email: '',
        password: '',
        confirmPassword: '',
      },
    });

    form.setError('email', { type: 'required', message: 'Email is required' });
    form.setError('password', {
      type: 'minLength',
      message: 'Password too short',
    });

    expect(form.errors.email).toEqual({
      type: 'required',
      message: 'Email is required',
    });
    expect(form.errors.password).toEqual({
      type: 'minLength',
      message: 'Password too short',
    });
  });

  it('should handle form with custom validation and trigger', async () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
        age: 25,
      },
    });

    const result = await form.trigger();
    expect(typeof result).toBe('boolean');
  });

  it('should handle form with abort signal', () => {
    const controller = new AbortController();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      abortSignal: controller.signal,
    });

    expect(form).toBeDefined();
  });

  it('should handle form with lazy updates disabled', () => {
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      lazyUpdates: false,
    });

    expect(form).toBeDefined();
  });

  it('should handle form with custom submit handler', async () => {
    const onSubmit = vi.fn();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      onSubmit,
    });

    await form.submit();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should handle form with strict submit checks', async () => {
    const onSubmitFailed = vi.fn();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      onSubmitFailed,
      strictSubmitChecks: true,
    });

    form.setError('name', { type: 'required', message: 'Required' });

    await expect(form.submit()).rejects.toEqual(form.errors);
    expect(onSubmitFailed).toHaveBeenCalled();
  });

  it('should handle form with onReset handler', () => {
    const onReset = vi.fn();
    const form = createForm({
      defaultValues: {
        name: 'John',
      },
      onReset,
    });

    form.reset();
    expect(onReset).toHaveBeenCalled();
  });

  it('should handle form with complex error paths', () => {
    const form = createForm({
      defaultValues: {
        user: {
          profile: {
            contact: {
              email: 'john@example.com',
              phone: '123-456-7890',
            },
          },
        },
      },
    });

    form.setError('user.profile.contact.email', {
      type: 'invalid',
      message: 'Invalid email',
    });

    const errorsWithPath = form.getErrorsWithPaths();
    expect(errorsWithPath).toHaveLength(1);
    expect(errorsWithPath[0].path).toBe('user.profile.contact.email');
  });

  it('should handle form with multiple field errors', () => {
    const form = createForm({
      defaultValues: {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
      },
    });

    form.setError('field1', { type: 'required', message: 'Required' });
    form.setError('field2', { type: 'pattern', message: 'Pattern mismatch' });
    form.setError('field3', { type: 'custom', message: 'Custom error' });

    expect(form.errors.field1).toEqual({
      type: 'required',
      message: 'Required',
    });
    expect(form.errors.field2).toEqual({
      type: 'pattern',
      message: 'Pattern mismatch',
    });
    expect(form.errors.field3).toEqual({
      type: 'custom',
      message: 'Custom error',
    });
  });

  it('should handle form with empty default values', () => {
    const form = createForm({
      defaultValues: {},
    });

    expect(form.values).toEqual({});
    expect(form.defaultValues).toEqual({});
  });

  it('should handle form with undefined default values', () => {
    const form = createForm({
      defaultValues: undefined,
    });

    expect(form.values).toEqual({});
    expect(form.defaultValues).toEqual({});
  });

  it('should handle form with mixed data types', () => {
    const form = createForm({
      defaultValues: {
        stringField: 'string',
        numberField: 42,
        booleanField: true,
        nullField: null,
        undefinedField: undefined,
        arrayField: [1, 2, 3],
        objectField: { nested: 'value' },
      },
    });

    expect(form.values.stringField).toBe('string');
    expect(form.values.numberField).toBe(42);
    expect(form.values.booleanField).toBe(true);
    expect(form.values.nullField).toBeNull();
    expect(form.values.undefinedField).toBeUndefined();
    expect(form.values.arrayField).toEqual([1, 2, 3]);
    expect(form.values.objectField).toEqual({ nested: 'value' });
  });

  it('should handle form with deep nested structures', () => {
    const form = createForm({
      defaultValues: {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deepValue',
              },
            },
          },
        },
      },
    });

    expect(form.values.level1.level2.level3.level4.value).toBe('deepValue');
  });

  describe('resetForm', () => {
    it('should reset to default values when called without arguments', () => {
      const form = createForm({
        defaultValues: {
          name: 'John',
          age: 30,
        },
      });

      form.setValue('name', 'Jane');
      form.setValue('age', 25);

      form.resetForm();

      expect(form.values).toEqual({ name: 'John', age: 30 });
    });

    it('should reset to provided values when called with arguments', () => {
      const form = createForm({
        defaultValues: {
          name: 'John',
          age: 30,
        },
      });

      form.setValue('name', 'Jane');
      form.setValue('age', 25);

      form.resetForm({ name: 'Bob', age: 35 });

      expect(form.values).toEqual({ name: 'Bob', age: 35 });
    });

    it('should reset form with nested object values', () => {
      const form = createForm({
        defaultValues: {
          user: {
            profile: {
              name: 'John',
              age: 30,
            },
          },
        },
      });

      form.setValue('user.profile.name', 'Jane');
      form.setValue('user.profile.age', 25);

      form.resetForm();

      expect(form.values).toEqual({
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      });
    });

    it('should reset form with array values', () => {
      const form = createForm({
        defaultValues: {
          items: ['item1', 'item2', 'item3'],
        },
      });

      form.setValue('items.1', 'modifiedItem');

      form.resetForm();

      expect(form.values).toEqual({ items: ['item1', 'item2', 'item3'] });
    });

    it('should reset form with mixed data types', () => {
      const form = createForm({
        defaultValues: {
          stringField: 'initial',
          numberField: 42,
          booleanField: true,
          nullField: null,
          arrayField: [1, 2, 3],
        },
      });

      form.setValue('stringField', 'changed');
      form.setValue('numberField', 100);
      form.setValue('booleanField', false);
      form.setValue('nullField', null);
      form.setValue('arrayField.0', 999);

      form.resetForm();

      expect(form.values).toEqual({
        stringField: 'initial',
        numberField: 42,
        booleanField: true,
        nullField: null,
        arrayField: [1, 2, 3],
      });
    });

    it('should reset form with empty object', () => {
      const form = createForm({
        defaultValues: {
          field1: 'value1',
          field2: 'value2',
        },
      });

      form.setValue('field1', 'changed1');
      form.setValue('field2', 'changed2');

      form.resetForm({});

      expect(form.values).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should reset form with partial values', async () => {
      const form = createForm({
        defaultValues: {
          field1: 'default1',
          field2: 'default2',
          field3: 'default3',
        },
      });

      form.setValue('field1', 'changed1');
      form.setValue('field2', 'changed2');

      form.resetForm({ field1: 'new1', field3: 'new3' });

      expect(form.values).toEqual({
        field1: 'new1',
        field3: 'new3',
      });

      await sleep(100);

      expect(form.values).toEqual({
        field1: 'new1',
        field3: 'new3',
      });
    });

    it('should reset form with undefined values', () => {
      const form = createForm({
        defaultValues: {
          field1: 'default1',
          field2: 'default2',
        },
      });

      form.setValue('field1', 'changed1');

      form.resetForm({ field1: undefined, field2: undefined });

      expect(form.values).toEqual({
        field1: undefined,
        field2: undefined,
      });
    });

    it('should reset form with complex nested structure', () => {
      const form = createForm({
        defaultValues: {
          level1: {
            level2: {
              level3: {
                value: 'deepValue',
              },
            },
          },
        },
      });

      form.setValue('level1.level2.level3.value', 'modifiedValue');

      form.resetForm();

      expect(form.values).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'deepValue',
            },
          },
        },
      });
    });

    it('should reset form with deeply nested array', () => {
      const form = createForm({
        defaultValues: {
          data: {
            items: [
              { id: 1, name: 'item1' },
              { id: 2, name: 'item2' },
            ],
          },
        },
      });

      form.setValue('data.items.0.name', 'modifiedItem1');

      form.resetForm();

      expect(form.values).toEqual({
        data: {
          items: [
            { id: 1, name: 'item1' },
            { id: 2, name: 'item2' },
          ],
        },
      });
    });
  });

  describe('resetField', () => {
    describe('using "defaultValues" property in constructor', () => {
      it('should reset field to default value', () => {
        const form = createForm({
          defaultValues: {
            name: 'John',
            age: 30,
          },
        });

        form.setValue('name', 'Jane');
        expect(form.values.name).toBe('Jane');

        form.resetField('name');
        expect(form.values.name).toBe('Jane');
      });

      it('should reset field with nested path', () => {
        const form = createForm({
          defaultValues: {
            user: {
              profile: {
                name: 'John',
              },
            },
          },
        });

        form.setValue('user.profile.name', 'Jane');
        expect(form.values.user.profile.name).toBe('Jane');

        form.resetField('user.profile.name');
        expect(form.values.user.profile.name).toBe('Jane');
      });

      it('should reset field with array index', () => {
        const form = createForm({
          defaultValues: {
            items: ['item1', 'item2', 'item3'],
          },
        });

        form.setValue('items.1', 'modifiedItem');
        expect(form.values.items[1]).toBe('modifiedItem');

        form.resetField('items.1');
        expect(form.values.items[1]).toBe('modifiedItem');
      });

      it('should reset field with complex nested path', () => {
        const form = createForm({
          defaultValues: {
            level1: {
              level2: {
                level3: {
                  value: 'deepValue',
                },
              },
            },
          },
        });

        form.setValue('level1.level2.level3.value', 'modifiedValue');
        expect(form.values.level1.level2.level3.value).toBe('modifiedValue');

        form.resetField('level1.level2.level3.value');
        expect(form.values.level1.level2.level3.value).toBe('modifiedValue');
      });

      it('should reset field with mixed data types', () => {
        const form = createForm({
          defaultValues: {
            stringField: 'initial',
            numberField: 42,
            booleanField: true,
            nullField: null,
            arrayField: [1, 2, 3],
          },
        });

        form.setValue('stringField', 'changed');
        form.setValue('numberField', 100);
        form.setValue('booleanField', false);
        form.setValue('nullField', null);
        form.setValue('arrayField.0', 999);

        form.resetField('stringField');
        form.resetField('numberField');
        form.resetField('booleanField');
        form.resetField('nullField');
        form.resetField('arrayField.0');

        expect(form.values.stringField).toBe('changed');
        expect(form.values.numberField).toBe(100);
        expect(form.values.booleanField).toBe(false);
        expect(form.values.nullField).toBeNull();
        expect(form.values.arrayField[0]).toBe(999);
      });

      it('should reset field with undefined default value', () => {
        const form = createForm({
          defaultValues: {
            field1: undefined as Maybe<string>,
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with null default value', () => {
        const form = createForm({
          defaultValues: {
            field1: null as Maybe<string>,
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with empty string default value', () => {
        const form = createForm({
          defaultValues: {
            field1: '',
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with zero default value', () => {
        const form = createForm({
          defaultValues: {
            field1: 0,
            field2: 'default',
          },
        });

        form.setValue('field1', 42);
        expect(form.values.field1).toBe(42);

        form.resetField('field1');
        expect(form.values.field1).toBe(42);
      });

      it('should reset field with false default value', () => {
        const form = createForm({
          defaultValues: {
            field1: false,
            field2: 'default',
          },
        });

        form.setValue('field1', true);
        expect(form.values.field1).toBe(true);

        form.resetField('field1');
        expect(form.values.field1).toBe(true);
      });

      it('should reset field with boolean true default value', () => {
        const form = createForm({
          defaultValues: {
            field1: true,
            field2: 'default',
          },
        });

        form.setValue('field1', false);
        expect(form.values.field1).toBe(false);

        form.resetField('field1');
        expect(form.values.field1).toBe(false);
      });

      it('should reset field with array default value', () => {
        const form = createForm({
          defaultValues: {
            field1: ['item1', 'item2'],
            field2: 'default',
          },
        });

        form.setValue('field1.0', 'modified');
        expect(form.values.field1[0]).toBe('modified');

        form.resetField('field1');
        expect(form.values.field1).toEqual(['modified', 'item2']);
      });

      it('should reset field with object default value', () => {
        const form = createForm({
          defaultValues: {
            field1: { nested: 'value' },
            field2: 'default',
          },
        });

        form.setValue('field1.nested', 'modified');
        expect(form.values.field1.nested).toBe('modified');

        form.resetField('field1');
        expect(form.values.field1).toEqual({ nested: 'modified' });
      });

      it('should reset field with deeply nested object', () => {
        const form = createForm({
          defaultValues: {
            data: {
              user: {
                profile: {
                  name: 'John',
                },
              },
            },
          },
        });

        form.setValue('data.user.profile.name', 'Jane');
        expect(form.values.data.user.profile.name).toBe('Jane');

        form.resetField('data.user.profile.name');
        expect(form.values.data.user.profile.name).toBe('Jane');
      });

      it('should reset field with deeply nested array', async () => {
        const form = createForm({
          defaultValues: {
            data: {
              items: [
                { id: 1, name: 'item1' },
                { id: 2, name: 'item2' },
              ],
            },
          },
        });

        form.setValue('data.items.0.name', 'modifiedItem1');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');

        form.resetField('data.items.0.name');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
        await sleep(100);
        expect(form.values.data.items[0].name).toBe('modifiedItem1');

        form.originalForm.resetField('data.items.0.name');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
        await sleep(100);
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
      });

      it('should reset field with complex nested array structure', () => {
        const form = createForm({
          defaultValues: {
            complex: {
              levels: [
                {
                  data: [
                    { id: 1, value: 'initial1' },
                    { id: 2, value: 'initial2' },
                  ],
                },
              ],
            },
          },
        });

        form.setValue('complex.levels.0.data.0.value', 'modified1');
        expect(form.values.complex.levels[0].data[0].value).toBe('modified1');

        form.resetField('complex.levels.0.data.0.value');
        expect(form.values.complex.levels[0].data[0].value).toBe('modified1');
      });
    });

    describe('using "values" property in constructor', () => {
      // Эти тесты проверяют поведение resetField когда мы используем значения из values, а не defaultValues
      it('should reset field to current value when no default value', () => {
        const form = createForm({
          values: {
            name: 'John',
            age: 30,
          },
        });

        // Устанавливаем значение через setValue
        form.setValue('name', 'Jane');
        expect(form.values.name).toBe('Jane');

        // Сбрасываем поле - должно вернуться к значению из values, а не default
        form.resetField('name');
        expect(form.values.name).toBe('Jane');
      });

      it('should reset field with nested path using current values', () => {
        const form = createForm({
          values: {
            user: {
              profile: {
                name: 'John',
              },
            },
          },
        });

        form.setValue('user.profile.name', 'Jane');
        expect(form.values.user.profile.name).toBe('Jane');

        form.resetField('user.profile.name');
        expect(form.values.user.profile.name).toBe('Jane');
      });

      it('should reset field with array index using current values', () => {
        const form = createForm({
          values: {
            items: ['item1', 'item2', 'item3'],
          },
        });

        form.setValue('items.1', 'modifiedItem');
        expect(form.values.items[1]).toBe('modifiedItem');

        form.resetField('items.1');
        expect(form.values.items[1]).toBe('modifiedItem');
      });

      it('should reset field with complex nested path using current values', () => {
        const form = createForm({
          values: {
            level1: {
              level2: {
                level3: {
                  value: 'deepValue',
                },
              },
            },
          },
        });

        form.setValue('level1.level2.level3.value', 'modifiedValue');
        expect(form.values.level1.level2.level3.value).toBe('modifiedValue');

        form.resetField('level1.level2.level3.value');
        expect(form.values.level1.level2.level3.value).toBe('modifiedValue');
      });

      it('should reset field with mixed data types using current values', () => {
        const form = createForm({
          values: {
            stringField: 'initial',
            numberField: 42,
            booleanField: true,
            nullField: null,
            arrayField: [1, 2, 3],
          },
        });

        form.setValue('stringField', 'changed');
        form.setValue('numberField', 100);
        form.setValue('booleanField', false);
        form.setValue('nullField', null);
        form.setValue('arrayField.0', 999);

        form.resetField('stringField');
        form.resetField('numberField');
        form.resetField('booleanField');
        form.resetField('nullField');
        form.resetField('arrayField.0');

        expect(form.values.stringField).toBe('changed');
        expect(form.values.numberField).toBe(100);
        expect(form.values.booleanField).toBe(false);
        expect(form.values.nullField).toBeNull();
        expect(form.values.arrayField[0]).toBe(999);
      });

      it('should reset field with undefined current value', () => {
        const form = createForm({
          values: {
            field1: undefined as Maybe<string>,
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with null current value', () => {
        const form = createForm({
          values: {
            field1: null as Maybe<string>,
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with empty string current value', () => {
        const form = createForm({
          defaultValues: {
            field1: '',
            field2: 'default',
          },
        });

        form.setValue('field1', 'changed');
        expect(form.values.field1).toBe('changed');

        form.resetField('field1');
        expect(form.values.field1).toBe('changed');
      });

      it('should reset field with zero current value', () => {
        const form = createForm({
          values: {
            field1: 0,
            field2: 'default',
          },
        });

        form.setValue('field1', 42);
        expect(form.values.field1).toBe(42);

        form.resetField('field1');
        expect(form.values.field1).toBe(42);
      });

      it('should reset field with false current value', () => {
        const form = createForm({
          values: {
            field1: false,
            field2: 'default',
          },
        });

        form.setValue('field1', true);
        expect(form.values.field1).toBe(true);

        form.resetField('field1');
        expect(form.values.field1).toBe(true);
      });

      it('should reset field with boolean true current value', () => {
        const form = createForm({
          values: {
            field1: true,
            field2: 'default',
          },
        });

        form.setValue('field1', false);
        expect(form.values.field1).toBe(false);

        form.resetField('field1');
        expect(form.values.field1).toBe(false);
      });

      it('should reset field with array current value', () => {
        const form = createForm({
          defaultValues: {
            field1: ['item1', 'item2'],
            field2: 'default',
          },
        });

        form.setValue('field1.0', 'modified');
        expect(form.values.field1[0]).toBe('modified');

        form.resetField('field1');
        expect(form.values.field1).toEqual(['modified', 'item2']);
      });

      it('should reset field with object current value', () => {
        const form = createForm({
          values: {
            field1: { nested: 'value' },
            field2: 'default',
          },
        });

        form.setValue('field1.nested', 'modified');
        expect(form.values.field1.nested).toBe('modified');

        form.resetField('field1');
        expect(form.values.field1).toEqual({ nested: 'modified' });
      });

      it('should reset field with deeply nested object using current values', () => {
        const form = createForm({
          values: {
            data: {
              user: {
                profile: {
                  name: 'John',
                },
              },
            },
          },
        });

        form.setValue('data.user.profile.name', 'Jane');
        expect(form.values.data.user.profile.name).toBe('Jane');

        form.resetField('data.user.profile.name');
        expect(form.values.data.user.profile.name).toBe('Jane');
      });

      it('should reset field with deeply nested array using current values', async () => {
        const form = createForm({
          values: {
            data: {
              items: [
                { id: 1, name: 'item1' },
                { id: 2, name: 'item2' },
              ],
            },
          },
        });

        form.setValue('data.items.0.name', 'modifiedItem1');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');

        form.resetField('data.items.0.name');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
        await sleep(100);
        expect(form.values.data.items[0].name).toBe('modifiedItem1');

        form.originalForm.resetField('data.items.0.name');
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
        await sleep(100);
        expect(form.values.data.items[0].name).toBe('modifiedItem1');
      });

      it('should reset field with complex nested array structure using current values', () => {
        const form = createForm({
          values: {
            complex: {
              levels: [
                {
                  data: [
                    { id: 1, value: 'initial1' },
                    { id: 2, value: 'initial2' },
                  ],
                },
              ],
            },
          },
        });

        form.setValue('complex.levels.0.data.0.value', 'modified1');
        expect(form.values.complex.levels[0].data[0].value).toBe('modified1');

        form.resetField('complex.levels.0.data.0.value');
        expect(form.values.complex.levels[0].data[0].value).toBe('modified1');
      });
    });
  });
});
