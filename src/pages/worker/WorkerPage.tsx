import { useLocation } from '@tanstack/react-router'
import { ROUTES } from '@/constants'
import { useMyProjects } from '@/hooks/useWorker'
import WorkerProjectBanner from './__components/WorkerProjectBanner'
import AttendanceTab from './__components/AttendanceTab'
import DailyLogTab from './__components/DailyLogTab'
import { Skeleton } from '@/pages/_components/ui/skeleton'

export default function WorkerPage() {
  const location = useLocation()
  const path = location.pathname
  const { data: projects, isLoading } = useMyProjects()
  const project = projects?.[0] ?? null

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-6 pb-10">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center gap-2 py-24 text-zinc-400 dark:text-zinc-500">
        <p className="text-sm">You are not assigned to any project yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <WorkerProjectBanner project={project} />
      {path === ROUTES.WORKER_DAILY_LOG ? (
        <DailyLogTab projectId={project.id} />
      ) : (
        <AttendanceTab projectId={project.id} />
      )}
    </div>
  )
}
