'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, MinusCircle, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface ReturnBookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transactionId: number | null
}

export function ReturnBookDialog({ open, onOpenChange, transactionId }: ReturnBookDialogProps) {
    const [returnDate, setReturnDate] = React.useState<Date>(new Date())
    const [perDayFee, setPerDayFee] = React.useState('2.00')
    const [isDebtCleared, setIsDebtCleared] = React.useState(false)
    const [calculatedFee, setCalculatedFee] = React.useState(0)

    const utils = api.useUtils()

    const transactionQuery = api.transaction.getById.useQuery(transactionId!, {
        enabled: !!transactionId,
        select: (data) => ({
            ...data,
            returnTransaction: data.returnTransaction || null
        })
    })

    const returnMutation = api.transaction.return.useMutation({
        onSuccess: () => {
            toast.success('Book returned successfully')
            onOpenChange(false)
            utils.transaction.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    React.useEffect(() => {
        if (transactionQuery.data) {
            const issueDate = new Date(transactionQuery.data?.issueDate ?? new Date())
            const days = Math.max(1, Math.ceil((returnDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)))
            const fee = Math.max(0, days * parseFloat(perDayFee))
            setCalculatedFee(fee)
        }
    }, [returnDate, perDayFee, transactionId, transactionQuery.data])

    const handleReturn = () => {
        if (!transactionId || !returnDate) {
            toast.error('Please select a return date')
            return
        }

        returnMutation.mutate({
            id: transactionId,
            returnDate,
            rentFee: calculatedFee,
            addToDebt: !isDebtCleared
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Return Book</DialogTitle>
                    <DialogDescription>Select the return date and set fees for this book.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Return Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'col-span-3 justify-start text-left font-normal',
                                        !returnDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {returnDate ? format(returnDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={(date) => date && setReturnDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Total Fee</Label>
                        <div className="col-span-3">
                            <p className="text-2xl font-bold">₹{calculatedFee.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="debtCleared" className="text-right">
                            Debt Cleared
                        </Label>
                        <div className="col-span-3">
                            <Switch id="debtCleared" checked={isDebtCleared} onCheckedChange={setIsDebtCleared} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleReturn} disabled={returnMutation.isPending}>
                        {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
