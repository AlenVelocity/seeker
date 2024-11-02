import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { Book } from '@/types/prisma'

interface IssueBookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    preselectedBook?: Book | null
}

export function IssueBookDialog({ open, onOpenChange, preselectedBook }: IssueBookDialogProps) {
    const [selectedMember, setSelectedMember] = React.useState<string>('')
    const [issueDate, setIssueDate] = React.useState<Date>(new Date())
    const utils = api.useUtils()

    const membersQuery = api.member.getAll.useQuery({ limit: 100 })

    const createMutation = api.transaction.create.useMutation({
        onSuccess: () => {
            toast.success('Book issued successfully')
            onOpenChange(false)
            utils.transaction.getAll.invalidate()
            utils.book.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleCreate = () => {
        if (!preselectedBook || !selectedMember || !issueDate) {
            toast.error('Please fill in all fields')
            return
        }

        const selectedMemberData = membersQuery.data?.items.find((member) => member.id.toString() === selectedMember)

        if (selectedMemberData?.outstandingDebt && selectedMemberData.outstandingDebt > 500) {
            toast.error('Member has outstanding fees over ₹500. Cannot issue book.')
            return
        }

        createMutation.mutate({
            bookId: preselectedBook.id,
            memberId: parseInt(selectedMember),
            issueDate
        })
    }

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSelectedMember('')
            setIssueDate(new Date())
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue {preselectedBook?.title}</DialogTitle>
                    <DialogDescription>Select a member and issue date for this book.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="member" className="text-right">
                            Member
                        </Label>
                        <Select value={selectedMember} onValueChange={setSelectedMember}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent>
                                {membersQuery.data?.items.map((member) => (
                                    <SelectItem
                                        key={member.id}
                                        value={member.id.toString()}
                                        disabled={member.outstandingDebt > 500}
                                    >
                                        {member.name}{' '}
                                        {member.outstandingDebt > 0 && `(Fees: ₹${member.outstandingDebt})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="issueDate" className="text-right">
                            Issue Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'col-span-3 justify-start text-left font-normal',
                                        !issueDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {issueDate ? format(issueDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={issueDate}
                                    onSelect={(date) => date && setIssueDate(date)}
                                    disabled={(date) => date < new Date('1900-01-01')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate} disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Issuing...' : 'Issue Book'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
