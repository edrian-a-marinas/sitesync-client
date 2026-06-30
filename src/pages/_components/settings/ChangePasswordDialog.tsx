import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import type { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form'
import { PasswordChangeSchema, type PasswordChangeInput } from '@/validations/user'
import { useChangePassword } from '@/hooks/useUser'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/pages/_components/ui/dialog'
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

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PasswordField<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  field,
  label,
  placeholder,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  label: string
  placeholder: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input type={visible ? 'text' : 'password'} placeholder={placeholder} className="pr-10" {...field} />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            tabIndex={-1}
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { mutate: changePassword, isPending } = useChangePassword()
  const form = useForm<PasswordChangeInput>({
    resolver: zodResolver(PasswordChangeSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  })

  useEffect(() => {
    if (open) form.reset({ current_password: '', new_password: '', confirm_new_password: '' })
  }, [open, form])

  const onSubmit = (data: PasswordChangeInput) => {
    if (data.new_password !== data.confirm_new_password) {
      toast.error('New password and confirmation do not match.')
      return
    }
    if (data.new_password === data.current_password) {
      toast.error('New password must be different from current password.')
      return
    }
    const payload = {
      current_password: data.current_password,
      new_password: data.new_password,
    }
    changePassword(payload, {
      onSuccess: () => {
        toast.success('Password changed successfully.')
        onOpenChange(false)
      },
      onError: (err: unknown) => {
        const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
        const message = typeof detail === 'string' ? detail : 'Current password is incorrect.'
        toast.error(message)
      },
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  const handleClear = () => {
    form.reset({ current_password: '', new_password: '', confirm_new_password: '' })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <PasswordField field={field} label="Current Password" placeholder="Enter your current password" />
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <PasswordField field={field} label="New Password" placeholder="At least 8 characters" />
              )}
            />
            <FormField
              control={form.control}
              name="confirm_new_password"
              render={({ field }) => (
                <PasswordField field={field} label="Confirm New Password" placeholder="Repeat your new password" />
              )}
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Password must be 8–72 characters. You will remain logged in after changing it.
            </p>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={handleClear} disabled={isPending}>
                Clear
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}