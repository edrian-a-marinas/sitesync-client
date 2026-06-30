import { useState } from 'react'
import { toast } from 'sonner'
import type { ProjectResponse } from '@/validations/project'
import { useDeleteProject } from '@/hooks/useProject'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'
import { Button } from '@/pages/_components/ui/button'
import { Input } from '@/pages/_components/ui/input'

interface Props {
  project: ProjectResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteConfirmDialog({
  project,
  open,
  onOpenChange,
}: Props) {
  const { mutate: deleteProject, isPending } = useDeleteProject()
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmInput, setConfirmInput] = useState('')

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1)
      setConfirmInput('')
    }
    onOpenChange(open)
  }

  const handleConfirm = () => {
    if (!project) return
    deleteProject(project.id, {
      onSuccess: () => {
        toast.success('Project deleted successfully')
        handleOpenChange(false)
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? 'Failed to delete project'
        toast.error(message)
      },
    })
  }

  const isMatch = confirmInput === project?.name

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {project?.name}
                </span>
                ? This action cannot be undone and will remove all associated
                phases and assignments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={() => setStep(2)}
              >
                Delete Project
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <p>You are about to permanently delete this project:</p>
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 flex flex-col gap-1 text-zinc-800 dark:text-zinc-200">
                    <span>
                      <span className="font-medium">Name:</span> {project?.name}
                    </span>
                    <span>
                      <span className="font-medium">Location:</span>{' '}
                      {project?.location}
                    </span>
                    <span>
                      <span className="font-medium">Status:</span>{' '}
                      {project?.status}
                    </span>
                    <span>
                      <span className="font-medium">Start:</span>{' '}
                      {project?.start_date}
                    </span>
                    <span>
                      <span className="font-medium">End:</span>{' '}
                      {project?.target_end_date}
                    </span>
                  </div>
                  <p>
                    To confirm, type{' '}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {project?.name}
                    </span>{' '}
                    below:
                  </p>
                  <Input
                    placeholder={project?.name}
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1)
                  setConfirmInput('')
                }}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={handleConfirm}
                disabled={!isMatch || isPending}
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
