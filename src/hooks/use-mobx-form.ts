import { useForm } from 'react-hook-form';

import {
  ConnectedMobxForm,
  ExtractFormContext,
  ExtractFormFieldValues,
  MobxForm,
} from '../mobx-form';

export const useMobxForm = <T extends MobxForm<any, any, any>>(
  mobxForm: T,
): ConnectedMobxForm<ExtractFormFieldValues<T>, ExtractFormContext<T>> =>
  // @ts-expect-error ts(2445)
  mobxForm.connect(useForm(mobxForm.params));
