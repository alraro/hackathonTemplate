import { Link, useNavigate } from "react-router"
import { z } from "zod"
import { PageHeader } from "@/components/common/PageHeader"
import { useSession } from "@/lib/session"
import { AuthForm } from "../AuthForm"

const schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
})

export default function SignupPage() {
  const { signUp } = useSession()
  const navigate = useNavigate()
  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <PageHeader title="Sign up" />
      <AuthForm
        schema={schema}
        defaults={{ name: "", email: "", password: "" }}
        fields={[
          { name: "name", label: "Name", autoComplete: "name" },
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
        ]}
        submitLabel="Create account"
        onSubmit={async (v) => {
          await signUp(v)
          navigate("/", { replace: true })
        }}
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="underline underline-offset-4">Log in</Link>
          </p>
        }
      />
    </div>
  )
}
