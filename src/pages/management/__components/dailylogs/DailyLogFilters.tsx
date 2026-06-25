import type { ProjectResponse } from '@/validations/project'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/pages/_components/ui/select'
import { Button } from '@/pages/_components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  projects: ProjectResponse[]
  projectsLoading: boolean
  selectedProjectId: number | null
  onProjectChange: (id: number) => void
  onNewLog: () => void
}

export default function DailyLogFilters({
  projects,
  projectsLoading,
  selectedProjectId,
  onProjectChange,
  onNewLog,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedProjectId !== null ? String(selectedProjectId) : ''}
        onValueChange={(v) => onProjectChange(Number(v))}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder={projectsLoading ? 'Loading...' : 'Select a project'} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedProjectId !== null && (
        <Button size="sm" onClick={onNewLog}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Log
        </Button>
      )}
    </div>
  )
}