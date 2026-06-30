import type { DailyLogResponse } from '@/types/dailyLog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/pages/_components/ui/sheet'
import { Badge } from '@/pages/_components/ui/badge'
import { ScrollArea } from '@/pages/_components/ui/scroll-area'
import { useState } from 'react'
import { CalendarIcon, CloudIcon, ClipboardList, StickyNote, User, Package, ImageIcon, Users, Wrench, AlertTriangle } from 'lucide-react'
import SitePhotosSection from './SitePhotosSection'
import MaterialsSection from './MaterialsSection'
import AttendanceSection from './AttendanceSection'
import EquipmentSection from './EquipmentSection'
import IncidentSection from './IncidentSection'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/pages/_components/ui/accordion'

const WEATHER_BADGE: Record<string, string> = {
  Sunny: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cloudy: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  Rainy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stormy: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Props {
  log: DailyLogResponse | null
  onOpenChange: (open: boolean) => void
}

export default function LogDetailSheet({ log, onOpenChange }: Props) {
  const [materialCount, setMaterialCount] = useState<number | undefined>(undefined)
  const [photoCount, setPhotoCount] = useState<number | undefined>(undefined)
  const [attendanceCount, setAttendanceCount] = useState<number | undefined>(undefined)
  const [equipmentCount, setEquipmentCount] = useState<number | undefined>(undefined)
  const [incidentCount, setIncidentCount] = useState<number | undefined>(undefined)
  const [openSections, setOpenSections] = useState<string[]>([])
  return (
    <Sheet open={!!log} onOpenChange={(open) => { if (!open && !document.querySelector('[data-sonner-toast]:hover')) onOpenChange(open) }} modal={false}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            {log?.log_date ?? '—'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="flex flex-col gap-6">

            {/* Submitted By */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <User className="h-3.5 w-3.5" />
                Submitted By
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {log?.submitted_by_name ?? '—'}
              </p>
            </div>

            {/* Weather */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <CloudIcon className="h-3.5 w-3.5" />
                Weather
              </div>
              {log?.weather_condition ? (
                <Badge
                  className={`w-fit text-xs font-medium ${WEATHER_BADGE[log.weather_condition] ?? 'bg-zinc-100 text-zinc-600'}`}
                  variant="outline"
                >
                  {log.weather_condition}
                </Badge>
              ) : (
                <span className="text-sm text-zinc-400">—</span>
              )}
            </div>

            {/* Work Accomplished */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <ClipboardList className="h-3.5 w-3.5" />
                Work Accomplished
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {log?.work_accomplished ?? '—'}
              </p>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                <StickyNote className="h-3.5 w-3.5" />
                Notes
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {log?.notes?.trim() ? log.notes : '—'}
              </p>
            </div>
            {/* Prefetch — mounts immediately so counts are available before accordion is opened */}
            {log && (
              <div className="hidden">
                <MaterialsSection projectId={log.project_id} logId={log.id} onCountChange={setMaterialCount} />
                <SitePhotosSection projectId={log.project_id} logId={log.id} onCountChange={setPhotoCount} />
                <AttendanceSection projectId={log.project_id} logId={log.id} onCountChange={setAttendanceCount} />
                <EquipmentSection projectId={log.project_id} logId={log.id} onCountChange={setEquipmentCount} />
                <IncidentSection projectId={log.project_id} logId={log.id} onCountChange={setIncidentCount} />
              </div>
            )}
             
            {log && (
              <Accordion type="multiple" className="flex flex-col gap-0" value={openSections} onValueChange={setOpenSections}>

                {/* Attendance */}
                <AccordionItem value="attendance" className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 mb-2">
                  <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 hover:no-underline py-3 [&>svg]:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Attendance
                      {attendanceCount !== undefined && attendanceCount > 0 && !openSections.includes('attendance') && (
                        <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
                          · {attendanceCount} worker{attendanceCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <AttendanceSection projectId={log.project_id} logId={log.id} onCountChange={setAttendanceCount} />
                  </AccordionContent>
                </AccordionItem>

                {/* Materials */}
                <AccordionItem value="materials" className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 mb-2">
                  <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 hover:no-underline py-3 [&>svg]:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Materials
                      {materialCount !== undefined && materialCount > 0 && !openSections.includes('materials') && (
                        <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
                          · {materialCount} item{materialCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <MaterialsSection projectId={log.project_id} logId={log.id} onCountChange={setMaterialCount} />
                  </AccordionContent>
                </AccordionItem>

                {/* Equipment */}
                <AccordionItem value="equipment" className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 mb-2">
                  <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 hover:no-underline py-3 [&>svg]:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />
                      Equipment
                      {equipmentCount !== undefined && equipmentCount > 0 && !openSections.includes('equipment') && (
                        <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
                          · {equipmentCount} item{equipmentCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <EquipmentSection projectId={log.project_id} logId={log.id} onCountChange={setEquipmentCount} />
                  </AccordionContent>
                </AccordionItem>

                {/* Incidents */}
                <AccordionItem value="incidents" className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 mb-2">
                  <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 hover:no-underline py-3 [&>svg]:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Incidents
                      {incidentCount !== undefined && incidentCount > 0 && !openSections.includes('incidents') && (
                        <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
                          · {incidentCount} incident{incidentCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <IncidentSection projectId={log.project_id} logId={log.id} onCountChange={setIncidentCount} />
                  </AccordionContent>
                </AccordionItem>

                {/* Site Photos */}
                <AccordionItem value="site-photos" className="border border-zinc-200 dark:border-zinc-700 rounded-lg px-3">
                  <AccordionTrigger className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500 hover:no-underline py-3 [&>svg]:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Site Photos & Documents
                      {photoCount !== undefined && photoCount > 0 && !openSections.includes('site-photos') && (
                        <span className="text-zinc-300 dark:text-zinc-600 font-normal normal-case tracking-normal">
                          · {photoCount}/10
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <SitePhotosSection projectId={log.project_id} logId={log.id} onCountChange={setPhotoCount} />
                  </AccordionContent>
                </AccordionItem>
                
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}