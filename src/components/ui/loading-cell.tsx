import { Loader2 } from 'lucide-react'
import { TableCell } from './table'

export function LoadingCell({ colSpan = 1 }: { colSpan?: number }) {
    return (
        <TableCell colSpan={colSpan} className="h-24 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </TableCell>
    )
}

export function LoadingCells({ columns }: { columns: number }) {
    return <LoadingCell colSpan={columns} />
}
