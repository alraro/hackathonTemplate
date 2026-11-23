import type { ReactNode } from "react"
import { useForm, type FieldValues, type Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export type AuthField<T extends FieldValues> = { name: Path<T>; label: string; type?: string; autoComplete?: string }

/** Shared form for login and signup: zod validation, labelled inputs, inline server error. */
export function AuthForm<T extends FieldValues>({
  schema,
  defaults,
  fields,
  submitLabel,
  onSubmit,
  footer,
}: {
  schema: z.ZodType<T, T>
  defaults: T
  fields: AuthField<T>[]
  submitLabel: string
  onSubmit: (values: T) => Promise<void>
  footer?: ReactNode
}) {
  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues: defaults as never })
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (e) {
      form.setError("root", { message: e instanceof Error ? e.message : "Something went wrong" })
    }
  })
  const rootError = form.formState.errors.root?.message
  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {fields.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{f.label}</FormLabel>
                <FormControl>
                  <Input type={f.type ?? "text"} autoComplete={f.autoComplete} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {rootError && (
          <p role="alert" className="text-sm text-destructive">
            {rootError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Please wait..." : submitLabel}
        </Button>
        {footer}
      </form>
    </Form>
  )
}
