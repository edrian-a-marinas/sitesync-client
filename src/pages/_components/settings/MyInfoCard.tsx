import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { UserUpdateSchema, type UserUpdateInput } from '@/validations/user'
import type { UserResponse } from '@/validations/auth'
import { useUpdateUser } from '@/hooks/useUser'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/pages/_components/ui/card'
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
}

export default function MyInfoCard({ user }: Props) {
  const updateUser = useUpdateUser()
  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      first_name: user.first_name,
      middle_name: '',
      last_name: user.last_name,
      phone_number: '',
    },
  })

  const onSubmit = async (data: UserUpdateInput) => {
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
    try {
      await updateUser.mutateAsync({ userId: user.id, data: payload })
      toast.success('Profile updated successfully.')
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      const message = typeof detail === 'string' ? detail : 'Failed to update profile.'
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Info</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Button type="submit" disabled={updateUser.isPending} className="mt-2 w-fit">
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}