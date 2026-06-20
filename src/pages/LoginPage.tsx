import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/hooks/useAuth'
import { LoginSchema } from '@/validations/auth'
import type { LoginInput } from '@/validations/auth'

export default function LoginPage() {
  const { mutate: login, isPending, isError } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Sign in to SiteSync</h1>
        <form onSubmit={handleSubmit((data) => login(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          {isError && <p className="text-xs text-red-500">Invalid email or password.</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}