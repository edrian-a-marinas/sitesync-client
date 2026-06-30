import { useState, useEffect } from 'react'
import { Input } from '@/pages/_components/ui/input'
import { Search } from 'lucide-react'
interface Props {
  onSearchChange: (value: string) => void
}
export default function DailyLogSearch({ onSearchChange }: Props) {
  const [value, setValue] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => onSearchChange(value), 400)
    return () => clearTimeout(timeout)
  }, [value, onSearchChange])
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search date, weather, work, notes..."
        className="pl-8"
      />
    </div>
  )
}
