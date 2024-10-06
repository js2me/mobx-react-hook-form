import { IDisposer } from 'disposer-util';
import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import { AnyObject } from 'yammies/utils/types';

export interface MobxFormParams<TFieldValues extends AnyObject, TContext = any>
  extends UseFormProps<TFieldValues, TContext> {
  disposer?: IDisposer;

  onSubmit?: SubmitHandler<TFieldValues>;
  onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
  onCancel?: VoidFunction;
}

export interface ConnectedMobxForm<
  TFieldValues extends AnyObject,
  TContext = any,
> extends Omit<UseFormReturn<TFieldValues, TContext>, 'handleSubmit'> {
  onSubmit: VoidFunction;
  onCancel: VoidFunction;
}
