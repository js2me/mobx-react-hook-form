import { useForm } from 'react-hook-form';
import type { AnyObject } from 'yammies/utils/types';

import { ConnectedMobxForm, MobxForm } from '../mobx-form';

export const useMobxForm = <TFieldValues extends AnyObject, TContext>(
  mobxForm: MobxForm<TFieldValues, TContext>,
): ConnectedMobxForm<TFieldValues, TContext> =>
  // @ts-expect-error ts(2445)
  mobxForm.connect(useForm(mobxForm.params));
