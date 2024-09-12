import { createContext, ReactNode, useContext } from 'react';

import { FormConstructor } from '../form-constructor';

const FormConstructorContext = createContext<FormConstructor<any>>(null as any);

export const FormConstructorProvider = ({
  formConstructor,
  children,
}: {
  formConstructor: FormConstructor<any>;
  children: ReactNode;
}) => {
  return (
    <FormConstructorContext.Provider value={formConstructor}>
      {children}
    </FormConstructorContext.Provider>
  );
};

export const useFormConstructor = () => useContext(FormConstructorContext);
