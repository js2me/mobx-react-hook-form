import { Disposer } from 'mobx-disposer-util';

export interface FormInputConfiguration {}

export interface FormViewConfiguration {}

export type FormRuleFn = (value: any) => MaybeFalsy<string>;

export interface FormRuleConfiguration {
  fn: FormRuleFn;
}

type FormInputsCollection = Record<string, FormInputConfiguration>;
type FormViewsCollection = Record<string, FormViewConfiguration>;
type FormRulesCollection = Record<string, FormRuleConfiguration>;

export interface FormConstructorConfig<
  Inputs extends FormInputsCollection = FormInputsCollection,
  Views extends FormViewsCollection = FormViewsCollection,
  Rules extends FormRulesCollection = FormRulesCollection,
> {
  inputs: Inputs;
  views: Views;
  rules: Rules;
}

export interface FormInputIsland<
  Name extends string,
  InputConfig extends FormInputConfiguration,
> {
  type: Name;
}

export interface FormViewIsland<
  Name extends string,
  ViewConfig extends FormViewConfiguration,
  C extends FormConstructorConfig,
> {
  type: Name;
  nested?: FormIslands<C>[];
}

export type FormInputIslands<C extends FormConstructorConfig> = ValueOf<{
  [K in keyof C['inputs']]: FormInputIsland<K & string, C['inputs'][K]>;
}>;

export type FormViewIslands<C extends FormConstructorConfig> = ValueOf<{
  [K in keyof C['views']]: FormInputIsland<K & string, C['views'][K]>;
}>;

export type FormIslands<C extends FormConstructorConfig> =
  | FormInputIslands<C>
  | FormViewIslands<C>;

export interface FormBuildConfig<
  FormData extends AnyObject,
  C extends FormConstructorConfig,
> {
  id?: string;
  disposer?: Disposer;
  islands: FormIslands<C>[];
  onSubmit: (formData: FormData) => Promise<void>;
  onSubmitFailure?: (error: unknown, formData: FormData) => void;
}
