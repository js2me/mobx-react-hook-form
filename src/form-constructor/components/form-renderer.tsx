import { observer } from 'mobx-react-lite';

import { MobxForm } from '../mobx-form';

export const FormRenderer = observer(
  ({ form }: { form: MobxForm<any, any> }) => {

  return (
    <>{form.}</>
  ); 
  },
);
