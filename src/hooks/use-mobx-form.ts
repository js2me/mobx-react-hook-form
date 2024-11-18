import { useForm } from 'react-hook-form';
import type { AnyObject } from 'yammies/utils/types';

import {
  ConnectedMobxForm,
  ExtractFormContext,
  ExtractFormFieldValues,
  MobxForm,
} from '../mobx-form';

export const useMobxForm = <T extends MobxForm<AnyObject, any, any>>(
  mobxForm: T,
): ConnectedMobxForm<ExtractFormFieldValues<T>, ExtractFormContext<T>> =>
  // @ts-expect-error ts(2445)
  mobxForm.connect(useForm(mobxForm.params));
