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

## API

This library uses [`createFormControl`](https://react-hook-form.com/docs/createFormControl).  
So API is almost identical with result of `createFormControl` function call.

Differences:

- `reset` method renamed to `resetForm`

## Additional API

### `changeField(name, value, opts)`

The same as [`setValue`](https://react-hook-form.com/docs/useform/setvalue), but will trigger validation if form was submitted  
Also you can pass `undefined` as value to remove value   
It should work the same as `field.onChange` from `react-hook-form`'s Controller

Example:

```tsx
// Update a single field
changeField("name", "value");

/** form submitted **/

changeField("name", "value"); // will call setValue('name', 'value', { shouldValidate: true })

changeField("name", undefined); // removes value
```

### `submit()`

This method is needed to pass into `<form />` as `onSubmit` prop, or you can call this method if you want to submit form

Example:

```tsx
const form = new Form();

const Component = () => {
  return (
    <form onSubmit={form.submit} onReset={form.reset}>
      ...
    </form>
  );
};
```

### `reset()`

This method is needed to pass into `<form />` as `onReset` prop, or you can call this method if you want to reset form

Example:

```tsx
const form = new Form();

const Component = () => {
  return (
    <form onSubmit={form.submit} onReset={form.reset}>
      ...
    </form>
  );
};
```
