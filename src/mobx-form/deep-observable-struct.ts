/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable sonarjs/cognitive-complexity */
import { action, makeObservable, observable, toJS } from 'mobx';
import { typeGuard } from 'yummies/type-guard';
import { AnyObject } from 'yummies/utils/types';

export class DeepObservableStruct<TData extends AnyObject> {
  data: TData;

  constructor(data: TData) {
    this.data = data;

    makeObservable(this, {
      data: observable.deep,
      set: action,
    });
  }

  set(newData: Partial<TData>) {
    const currentData = toJS(this.data);
    const stack: {
      key: string;
      currObservable: AnyObject;
      curr: AnyObject;
      new: AnyObject;
    }[] = Object.keys(currentData).map((it) => ({
      key: it,
      currObservable: this.data,
      curr: currentData,
      new: newData,
    }));

    while (stack.length > 0) {
      const item = stack.shift()!;
      const newValue = item.new[item.key];
      const currValue = item.curr[item.key];

      if (item.key in item.new) {
        if (typeGuard.isObject(newValue) && typeGuard.isObject(currValue)) {
          const newValueKeys = Object.keys(newValue);

          Object.keys(currValue).forEach((key) => {
            if (!(key in newValue)) {
              delete item.currObservable[item.key][key];
            }
          });

          newValueKeys.forEach((key) => {
            stack.push({
              key,
              currObservable: item.currObservable[item.key],
              curr: currValue,
              new: newValue,
            });
          });
        } else if (newValue !== currValue) {
          item.currObservable[item.key] = newValue;
        }
      } else {
        delete item.currObservable[item.key];
      }
    }

    Object.keys(newData).forEach((newDataKey) => {
      if (!currentData[newDataKey]) {
        // @ts-ignore
        this.data[newDataKey] = newData[newDataKey];
      }
    });
  }
}
