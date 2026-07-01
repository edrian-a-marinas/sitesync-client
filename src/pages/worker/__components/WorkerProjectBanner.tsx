import type { WorkerProject } from '@/types/worker'
import { Badge } from '@/pages/_components/ui/badge'
import { MapPin, Calendar } from 'lucide-react'

interface Props {
  project: WorkerProject
}

export default function WorkerProjectBanner({ project }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {project.name}
            </h1>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {project.start_date} → {project.target_end_date}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
