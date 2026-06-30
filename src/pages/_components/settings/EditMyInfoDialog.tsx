import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { UserUpdateSchema, type UserUpdateInput } from '@/validations/user'
import type { UserResponse } from '@/validations/auth'
import { useUpdateUser } from '@/hooks/useUser'
import { useAuthStore } from '@/store/auth'
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
  user: UserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditMyInfoDialog({ user, open, onOpenChange }: Props) {
  const { mutate: updateUser, isPending } = useUpdateUser()
  const setAuth = useAuthStore((s) => s.setAuth)
  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      first_name: user.first_name,
      middle_name: '',
      last_name: user.last_name,
      phone_number: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: '',
        phone_number: '',
      })
    }
  }, [open, user, form])

  const onSubmit = (data: UserUpdateInput) => {
    const hasChanges =
      (data.first_name && data.first_name !== user.first_name) ||
      (data.last_name && data.last_name !== user.last_name) ||
      !!data.middle_name ||
      !!data.phone_number
    if (!hasChanges) {
      toast.error('Nothing to update.')
      return
    }
    const payload = {
      ...data,
      middle_name: data.middle_name || undefined,
      phone_number: data.phone_number || undefined,
    }
    updateUser(
      { userId: user.id, data: payload },
      {
        onSuccess: (updated) => {
          setAuth({ ...user, ...updated })
          toast.success('Profile updated successfully.')
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const detail = (err as { response?: { data?: { detail?: unknown } } })
            ?.response?.data?.detail
          const message =
            typeof detail === 'string' ? detail : 'Failed to update profile.'
          toast.error(message)
        },
      },
    )
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Middle Name{' '}
                    <span className="text-zinc-400 text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone{' '}
                    <span className="text-zinc-400 text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+63 912 345 6789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
