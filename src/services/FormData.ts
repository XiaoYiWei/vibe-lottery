import { Context, Effect } from 'effect'

interface FormDataService {
  readonly get: (name: string) => Effect.Effect<FormDataEntryValue, Error>
}

export class FormDataContext extends Context.Tag('FormDataContext')<
  FormDataContext,
  FormDataService
>() {
  static fromFormData = (formData: FormData) =>
    FormDataContext.of({
      get: (name: string) =>
        Effect.fromNullable(formData.get(name)).pipe(
          Effect.orElseFail(() => new Error(`Form field '${name}' not found`))
        )
    })
}