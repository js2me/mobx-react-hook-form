import { IDisposer } from 'disposer-util';
import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import { AnyObject } from 'yammies/utils/types';

/**
 * Additional options for {@link MobxForm} constructor
 */
export interface MobxFormParams<TFieldValues extends AnyObject, TContext = any>
  extends UseFormProps<TFieldValues, TContext> {
  /**
   * Disposer for mobx form
   */
  disposer?: IDisposer;
  /**
   * Form submit handler
   */
  onSubmit?: SubmitHandler<TFieldValues>;
  /**
   * Form submit failed handler
   */
  onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
  /**
   * Form reset handler
   */
  onReset?: VoidFunction;
  /**
   * Dynamic change react-hook-form params, works as reaction
   */
  getParams?: () => Partial<UseFormProps<TFieldValues, TContext>>;
}

/**
 * Interface for a connected Mobx form.
 * Extends the properties of react-hook-form's UseFormReturn,
 * excluding the 'handleSubmit' method, and adds custom form handlers.
 */
export interface ConnectedMobxForm<
  TFieldValues extends AnyObject,
  TContext = any,
> extends Omit<UseFormReturn<TFieldValues, TContext>, 'handleSubmit'> {
  /**
   * Handler to reset the form.
   */
  onReset: VoidFunction;
  /**
   * Handler to submit the form.
   */
  onSubmit: VoidFunction;
}
