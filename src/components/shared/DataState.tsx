import { AlertCircle, Inbox } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export function EmptyState({ message = 'No hay resultados' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
      <Inbox className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  )
}