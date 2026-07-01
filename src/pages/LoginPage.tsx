import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { HardHat } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import { LoginSchema } from '@/validations/auth'
import type { LoginInput } from '@/validations/auth'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'
import { DemoLoginButton } from '@/demo/DemoLoginButton' // DEMO FEATURE: remove this import if demo mode is retired

export default function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin()
  const isAccessDenied = (error as Error)?.message === 'ACCESS_DENIED'
  const isNetworkError = axios.isAxiosError(error) && !error.response
  const isServerConfigError =
    axios.isAxiosError(error) &&
    !!error.response &&
    error.response.status !== 401
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  return (
    <div className="flex min-h-screen" data-theme="light">
      {/* Left panel — brand */}
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500">
            <HardHat className="h-5 w-5 text-zinc-900" />
          </div>
          <span className="text-lg font-semibold text-white">SiteSync</span>
        </div>
        <p className="max-w-sm text-2xl font-medium leading-snug text-white">
          Every shift, every log, every site — tracked in one place.
        </p>
        <p className="text-sm text-zinc-400">
          Built for owners, project managers, and site workers.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500">
              <HardHat className="h-5 w-5 text-zinc-900" />
            </div>
            <span className="text-lg font-semibold text-zinc-900">
              SiteSync
            </span>
          </div>
          <h1 className="mb-1 text-2xl font-semibold text-zinc-900">Sign in</h1>
          <p className="mb-6 text-sm text-zinc-500">
            Enter your credentials to access your account.
          </p>
          <form
            onSubmit={handleSubmit((data) => login(data))}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-900"
              >
                Email
              </label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-900"
              >
                Password
              </label>
              <Input
                id="password"
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400"
              />
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            {isError && !isAccessDenied && isNetworkError && (
              <p className="text-xs text-red-600">
                Unable to reach the server. Please check your connection or try
                again later.
              </p>
            )}
            {isError && !isAccessDenied && isServerConfigError && (
              <p className="text-xs text-red-600">
                Server error. Please try again later.
              </p>
            )}
            {isError &&
              !isAccessDenied &&
              !isNetworkError &&
              !isServerConfigError && (
                <p className="text-xs text-red-600">
                  Invalid email or password.
                </p>
              )}
            {isAccessDenied && (
              <p className="text-xs text-red-600">Wrong credentials</p>
            )}{' '}
            {/* hides owner/pm from worker-only /login route, wrong creds because its meant to be secret*/}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <DemoLoginButton />{' '}
          {/* DEMO FEATURE: remove this line if demo mode is retired */}
        </div>
      </div>
    </div>
  )
}
