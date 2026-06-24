import { toast } from 'sonner'
import type { ProjectResponse } from '@/validations/project'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/pages/_components/ui/alert-dialog'

interface Props {
  project: ProjectResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteConfirmDialog({ project, open, onOpenChange }: Props) {
  // NOTE: Backend has no DELETE /projects/:id endpoint yet.
  // This is a placeholder — wire up useDeleteProject hook when backend adds it.
  const handleConfirm = () => {
    if (!project) return
    console.log('[DeleteConfirmDialog] confirmed delete for project:', project.id, project.name)
    toast.info(`Delete for "${project.name}" is not yet supported by the backend.`)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {project?.name}
            </span>
            ? This action cannot be undone and will remove all associated phases and assignments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={handleConfirm}
          >
            Delete Project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}