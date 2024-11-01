'use client'

import * as React from 'react'
import { CalendarIcon, MoreHorizontal, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { IssueBookDialog } from '@/components/IssueBookDialog'
import { Switch } from '@/components/ui/switch'
import { LoadingCell, LoadingCells } from '@/components/ui/loading-cell'

export default function TransactionsPage() {
    const [isNewTransactionOpen, setIsNewTransactionOpen] = React.useState(false)
    const [isReturnDialogOpen, setIsReturnDialogOpen] = React.useState(false)
    const [selectedTransaction, setSelectedTransaction] = React.useState<number | null>(null)
    const [selectedBook, setSelectedBook] = React.useState<string>('')
    const [selectedMember, setSelectedMember] = React.useState<string>('')
    const [issueDate, setIssueDate] = React.useState<Date>(new Date())
    const [returnDate, setReturnDate] = React.useState<Date>()
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [perDayFee, setPerDayFee] = React.useState('2.00')
    const [isDebtCleared, setIsDebtCleared] = React.useState(false)
    const [calculatedFee, setCalculatedFee] = React.useState(0)

    const utils = api.useUtils()

    // Queries
    const transactionsQuery = api.transaction.getAll.useQuery({
        page: currentPage,
        search: searchTerm
    })

    const booksQuery = api.book.getAll.useQuery({ limit: 100 })
    const membersQuery = api.member.getAll.useQuery({ limit: 100 })

    // Mutations
    const createMutation = api.transaction.create.useMutation({
        onSuccess: () => {
            toast.success('Transaction created successfully')
            setIsNewTransactionOpen(false)
            utils.transaction.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const returnMutation = api.transaction.return.useMutation({
        onSuccess: () => {
            toast.success('Book returned successfully')
            setIsReturnDialogOpen(false)
            utils.transaction.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const deleteMutation = api.transaction.delete.useMutation({
        onSuccess: () => {
            toast.success('Transaction deleted successfully')
            utils.transaction.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const calculateFee = React.useCallback(
        (returnDate: Date | undefined) => {
            if (!returnDate || !selectedTransaction) return 0

            const transaction = transactionsQuery.data?.transactions.find((t) => t.id === selectedTransaction)
            if (!transaction) return 0

            const days = Math.ceil(
                (returnDate.getTime() - new Date(transaction.issueDate).getTime()) / (1000 * 60 * 60 * 24)
            )
            const fee = days * parseFloat(perDayFee)
            setCalculatedFee(fee)
            return fee
        },
        [selectedTransaction, perDayFee, transactionsQuery.data?.transactions]
    )

    React.useEffect(() => {
        calculateFee(returnDate)
    }, [returnDate, calculateFee])

    const handleReturn = () => {
        if (!selectedTransaction || !returnDate) {
            toast.error('Please select a return date')
            return
        }

        returnMutation.mutate({
            id: selectedTransaction,
            returnDate,
            rentFee: calculatedFee,
            addToDebt: !isDebtCleared
        })
    }

    const handlePerDayFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setPerDayFee(value)
            calculateFee(returnDate)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Manage book loans and returns</p>
                </div>
            </header>
            <div className="mb-4 flex items-center justify-between">
                <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <IssueBookDialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen} />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Rent Fee</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactionsQuery.isLoading ? (
                        <TableRow>
                            <LoadingCells columns={7} />
                        </TableRow>
                    ) : transactionsQuery.data?.transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactionsQuery.data?.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.id}</TableCell>
                                <TableCell>{transaction.book.title}</TableCell>
                                <TableCell>{transaction.member.name}</TableCell>
                                <TableCell>{format(new Date(transaction.issueDate), 'PPP')}</TableCell>
                                <TableCell>
                                    {transaction.returnDate
                                        ? format(new Date(transaction.returnDate), 'PPP')
                                        : 'Not returned'}
                                </TableCell>
                                <TableCell>
                                    {transaction.rentFee ? `₹${transaction.rentFee.toFixed(2)}` : '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {!transaction.returnDate && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction.id)
                                                        setIsReturnDialogOpen(true)
                                                    }}
                                                >
                                                    Return Book
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => deleteMutation.mutate(transaction.id)}
                                            >
                                                Delete transaction
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Book</DialogTitle>
                        <DialogDescription>Select the return date and set fees for this book.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Return Date</Label>
                            <div className="col-span-3">
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={setReturnDate}
                                    className="rounded-md border"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="perDayFee" className="text-right">
                                Per Day Fee (₹)
                            </Label>
                            <div className="col-span-3">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                    <Input
                                        id="perDayFee"
                                        type="text"
                                        value={perDayFee}
                                        onChange={handlePerDayFeeChange}
                                        className="pl-7"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
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
        </div>
    )
}
