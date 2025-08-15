/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-prototype-builtins */
/* eslint-disable sonarjs/cognitive-complexity */
import { action, makeObservable, observable } from 'mobx';
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
    type StackItem = [key: string, currObservable: AnyObject, new: AnyObject];

    const stack: StackItem[] = Object.keys(this.data).map((key) => [
      key,
      this.data,
      newData,
    ]);

    while (stack.length > 0) {
      const [key, currObservableData, newData] = stack.shift()!;
      const newValue = newData[key];
      const currValue = currObservableData[key];

      if (key in newData) {
        if (typeGuard.isObject(newValue) && typeGuard.isObject(currValue)) {
          const newValueKeys = Object.keys(newValue);

          Object.keys(currValue).forEach((childKey) => {
            if (!(childKey in newValue)) {
              delete currObservableData[key][childKey];
            }
          });

          newValueKeys.forEach((childKey) => {
            stack.push([childKey, currObservableData[key], newValue]);
          });
        } else if (newValue !== currValue) {
          currObservableData[key] = newValue;
        }
      } else {
        delete currObservableData[key];
      }
    }

    Object.keys(newData).forEach((newDataKey) => {
      if (!this.data[newDataKey]) {
        // @ts-ignore
        this.data[newDataKey] = newData[newDataKey];
      }
    });
  }
}
