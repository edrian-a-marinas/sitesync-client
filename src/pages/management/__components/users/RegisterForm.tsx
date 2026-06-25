import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/validations/auth'
import { ROLES } from '@/constants'
import { useQueryClient } from '@tanstack/react-query'
import { registerUser } from '@/services/auth'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/pages/_components/ui/form'
import { Input } from '@/pages/_components/ui/input'
import { Button } from '@/pages/_components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/pages/_components/ui/radio-group'
import { Label } from '@/pages/_components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/pages/_components/ui/tooltip'

interface OwnerRegisterFormProps {
  onSuccess?: () => void
  isOwner?: boolean
}

// --- Used in ManageUsersPage ---
export default function OwnerRegisterForm({ onSuccess, isOwner = false }: OwnerRegisterFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      phone_number: '',
      role_id: isOwner ? ROLES.PROJECT_MANAGER : ROLES.SITE_WORKER,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (data: RegisterInput) => {
    try {
      const payload = {
        ...data,
        middle_name: data.middle_name || undefined,
        phone_number: data.phone_number || undefined,
      }
      console.log('[OwnerRegisterForm] submitting:', payload)
      await registerUser(payload)
      console.log('[OwnerRegisterForm] success')
      toast.success('User registered successfully.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      form.reset()
      onSuccess?.()
    } catch (err: unknown) {
      console.error('[OwnerRegisterForm] error:', err)
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const message = typeof detail === 'string'
        ? detail
        : 'Failed to register user. Please try again.'
      toast.error(message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Role Selection */}
        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <TooltipProvider>
                  <RadioGroup
                    value={String(field.value)}
                    onValueChange={(v) => {
                      if (!isOwner && Number(v) === ROLES.PROJECT_MANAGER) return
                      field.onChange(Number(v))
                    }}
                    className="flex gap-6"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-2 ${!isOwner ? 'cursor-not-allowed opacity-40' : ''}`}>
                          <RadioGroupItem
                            value={String(ROLES.PROJECT_MANAGER)}
                            id="role-pm"
                            disabled={!isOwner}
                          />
                          <Label htmlFor="role-pm" className={!isOwner ? 'cursor-not-allowed' : ''}>
                            Project Manager
                          </Label>
                        </div>
                      </TooltipTrigger>
                      {!isOwner && (
                        <TooltipContent>
                          Only Owners can create Project Managers
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={String(ROLES.SITE_WORKER)} id="role-worker" />
                      <Label htmlFor="role-worker">Site Worker</Label>
                    </div>
                  </RadioGroup>
                </TooltipProvider>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Row */}
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Cruz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dela Cruz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan@sitesync.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Min. 8 characters" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="+63 912 345 6789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Registering...' : 'Register User'}
        </Button>

      </form>
    </Form>
  )
}