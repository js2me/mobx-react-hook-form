# [mobx-react-hook-form](https://github.com/js2me/mobx-react-hook-form)

Simple [react-hook-form](https://react-hook-form.com/) wrapper for [MobX](https://mobx.js.org/).  

## Usage  

```tsx
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { Form } from "mobx-react-hook-form";

const form = new Form({
  resolver: valibotResolver(
    v.object({
      username: v.string('This field is required')
    })
  ),
  onSubmit: ({ username }) => {
    console.info("nick username", username);
  },
  onSubmitFailed: () => {
    //
  },
  onReset: () => {
    //
  }
})


const YourView = observer(() => {
  return (
    <form onSubmit={form.submit} onReset={form.reset}>
      <Controller control={form.control} name={'username'} render={...} />
    </form>
  )
})

```
