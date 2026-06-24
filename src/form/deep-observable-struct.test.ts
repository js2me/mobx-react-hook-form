import { autorun } from 'mobx';
import { describe, expect, it } from 'vitest';
import { DeepObservableStruct } from 'yummies/mobx';

describe('DeepObservableStruct array updates', () => {
  it('should grow observable array when a new index is merged', () => {
    const struct = new DeepObservableStruct({
      values: {
        sections: [
          { title: 'Section 1', type: 'editor' },
          { title: 'Section 2', type: 'link' },
        ],
      },
    });

    const observedLengths: number[] = [];
    const dispose = autorun(() => {
      observedLengths.push(struct.data.values.sections.length);
    });

    struct.set({
      values: {
        sections: [
          { title: 'Section 1', type: 'editor' },
          { title: 'Section 2', type: 'link' },
          { title: 'New Section', type: 'editor' },
        ],
      },
    });

    dispose();

    expect(struct.data.values.sections).toHaveLength(3);
    expect(observedLengths).toEqual([2, 3]);
  });

  it('should shrink observable array when items are removed', () => {
    const struct = new DeepObservableStruct({
      values: {
        sections: [
          { title: 'Section 1', type: 'editor' },
          { title: 'Section 2', type: 'link' },
          { title: 'Section 3', type: 'editor' },
        ],
      },
    });

    struct.set({
      values: {
        sections: [
          { title: 'Section 1', type: 'editor' },
          { title: 'Section 2', type: 'link' },
        ],
      },
    });

    expect(struct.data.values.sections).toHaveLength(2);
  });
});
