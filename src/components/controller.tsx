import { Observer } from 'mobx-react-lite';
import { Controller as LibController } from 'react-hook-form';

export const Controller = ((props: any) => (
  <LibController
    {...props}
    render={(renderProps) => (
      <Observer>{() => props.render(renderProps)}</Observer>
    )}
  />
)) as unknown as typeof LibController;
