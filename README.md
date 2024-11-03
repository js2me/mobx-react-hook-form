# [mobx-react-hook-form](https://github.com/js2me/mobx-react-hook-form)

Simple [react-hook-form](https://react-hook-form.com/) wrapper for [MobX](https://mobx.js.org/).  

## Usage  

```tsx
import { reaction } from "mobx"
import { MobxForm } from "mobx-react-hook-form"

class YourVM { 
  form = new MobxForm({
    disposer?: this.disposer,
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

  mount(){
    reaction(
      () => this.form.data?.username,
      (username) => {
        //
      }
    )
  }
}


const YourView = () => {
  const form = useMobxForm(yourVM.form)


  return (
    <form onSubmit={form.onSubmit} onReset={form.onReset}>
      <Controller control={form.control} name={'username'} render={...} />
    </form>
  )
}

```
