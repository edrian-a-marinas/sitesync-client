import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserUpdateSchema, type UserUpdateInput, type UserResponse } from '@/validations/auth'
import { useUpdateUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

// --- Used in ManageUsersPage ---
export default function EditUserDialog({ user, onOpenChange }: Props) {
  const updateUser = useUpdateUser()

  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      phone_number: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: '',
        phone_number: '',
      })
    }
  }, [user, form])

  const onSubmit = async (data: UserUpdateInput) => {
    if (!user) return
    try {
      console.log('[EditUserDialog] submitting:', user.id, data)
      await updateUser.mutateAsync({ userId: user.id, data })
      toast.success('User updated successfully.')
      onOpenChange(false)
    } catch (err) {
      console.error('[EditUserDialog] error:', err)
      toast.error('Failed to update user.')
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit User — {user?.first_name} {user?.last_name}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
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
                  <FormLabel>Middle Name <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone <span className="text-zinc-400 text-xs">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="+63 912 345 6789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateUser.isPending} className="mt-2 w-full">
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}