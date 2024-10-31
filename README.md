# mobx-react-hook-form  


Simple wrapper for `react-hook-form` package   


## Usage  

```tsx
import { MobxForm } from "mobx-react-hook-form"

class YourVM { 
  form = new MobxForm()
}


const YourView = () => {
  const form = useMobxForm(yourVM.form)


  return (
    <form {...form.register(...)}></form>
  )
}

```
