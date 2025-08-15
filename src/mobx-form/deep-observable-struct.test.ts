import { reaction } from 'mobx';
import { describe, expect, it, vi } from 'vitest';
import { DeepObservableStruct } from './deep-observable-struct';

const dataSet = {
  values: {
    a1: 1,
    a2: 'string',
    a3: 'strign',
    a4: 1,
    a5: { a5_1: 0, a5_2: 0, a5_3: 0, a5_4: 0 },
    a6: {
      a6_1: ['1', '2', '3'],
      a6_2: false,
      a6_3: false,
      a6_4: ['1', '2', '3'],
      a6_5: [],
    },
    a7: {},
    a8: {
      a8_1: { a8_1_1: true, a8_1_2: '' },
    },
    a9: 'string',
    a10: 'string',
  },
};

describe('DeepObservableStruct', () => {
  it('should set data correctly', () => {
    const sourceValue = structuredClone(dataSet);
    const struct = new DeepObservableStruct(sourceValue);

    expect(struct.data).toEqual(structuredClone(dataSet));

    const nextData = structuredClone(dataSet);
    nextData.values.a8.a8_1.a8_1_2 = 'new value';

    struct.set(nextData);

    expect(struct.data).toEqual(nextData);
  });

  it('should MobX reaction ignores all updates expect real changes', () => {
    const sourceValue = structuredClone(dataSet);
    const struct = new DeepObservableStruct(sourceValue);

    expect(struct.data).toEqual(structuredClone(dataSet));

    const reaction1Spy = vi.fn();
    const reaction2Spy = vi.fn();
    const reaction3Spy = vi.fn();
    const reaction4Spy = vi.fn();

    reaction(() => struct.data.values.a2, reaction1Spy);
    reaction(() => struct.data.values.a8, reaction2Spy);
    reaction(() => struct.data.values.a8.a8_1, reaction3Spy);
    reaction(() => struct.data.values.a8.a8_1.a8_1_2, reaction4Spy);

    const nextData = structuredClone(dataSet);
    nextData.values.a8.a8_1.a8_1_2 = 'new value';

    struct.set(nextData);

    expect(reaction1Spy).not.toBeCalled();
    expect(reaction2Spy).not.toBeCalled();
    expect(reaction3Spy).not.toBeCalled();
    expect(reaction4Spy).toBeCalledTimes(1);
  });
});
