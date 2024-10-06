import { useForm } from 'react-hook-form';
import { AnyObject } from 'yammies/utils/types';

import { ConnectedMobxForm, MobxForm } from '../mobx-form';

export const useMobxForm = <TFieldValues extends AnyObject, TContext>(
  mobxForm: MobxForm<TFieldValues, TContext>,
): ConnectedMobxForm<TFieldValues, TContext> => {
  const reactHookForm = useForm(mobxForm.getRHFParams());
  return mobxForm.connectRHF(reactHookForm);
};
