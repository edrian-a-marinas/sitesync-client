import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegister } from '@/hooks/useAuth'
import { RegisterSchema } from '@/validations/auth'
import { ROLES } from '@/constants'
import type { RegisterInput } from '@/validations/auth'

export default function PmRegisterForm() {
  const { mutate: register, isPending, isError, isSuccess } = useRegister()
  const { register: field, handleSubmit, reset, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role_id: ROLES.SITE_WORKER },
  })

  const onSubmit = (data: RegisterInput) => {
    register(data, { onSuccess: () => reset({ role_id: ROLES.SITE_WORKER }) })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Register Site Worker</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">First Name</label>
            <input {...field('first_name')} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Middle Name (optional)</label>
            <input {...field('middle_name')} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Last Name</label>
            <input {...field('last_name')} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Email</label>
            <input {...field('email')} type="email" className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Password</label>
            <input {...field('password')} type="password" className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Phone (optional)</label>
            <input {...field('phone_number')} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400" />
          </div>
          <input type="hidden" {...field('role_id', { valueAsNumber: true })} />
          {isError && <p className="text-xs text-red-500">Registration failed. Please try again.</p>}
          {isSuccess && <p className="text-xs text-green-500">Worker registered successfully.</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending ? 'Registering...' : 'Register Worker'}
          </button>
        </form>
      </div>
    </div>
  )
}