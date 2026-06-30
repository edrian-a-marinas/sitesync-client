import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { PasswordResetSchema, type PasswordResetInput } from '@/validations/user'
import type { UserResponse } from '@/validations/auth'
import { useResetPassword } from '@/hooks/useUser'
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
  user: UserResponse | null
  onOpenChange: (open: boolean) => void
}

export default function ResetPasswordDialog({ user, onOpenChange }: Props) {
  const { mutate: resetPassword, isPending } = useResetPassword()
  const [visible, setVisible] = useState(false)
  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: { new_password: '' },
  })

  useEffect(() => {
    if (user) {
      form.reset({ new_password: '' })
      setVisible(false)
    }
  }, [user, form])

  const onSubmit = (data: PasswordResetInput) => {
    if (!user) return
    resetPassword(
      { userId: user.id, data },
      {
        onSuccess: () => {
          toast.success(`Password reset for ${user.first_name} ${user.last_name}.`)
          onOpenChange(false)
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.detail
          const message = typeof detail === 'string' ? detail : 'Failed to reset password.'
          toast.error(message)
        },
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={!!user} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Reset Password — {user?.first_name} {user?.last_name}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={visible ? 'text' : 'password'} placeholder="At least 8 characters" className="pr-10" {...field} />
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
              )}
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              This sets the user's password directly. They will need to log in with this new password.
            </p>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}