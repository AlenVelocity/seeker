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

// Mock data based on the schema
const transactions = [
    {
        id: 1,
        bookTitle: 'To Kill a Mockingbird',
        memberName: 'John Doe',
        issueDate: new Date('2023-06-01'),
        returnDate: new Date('2023-06-15'),
        rentFee: 5.0
    },
    {
        id: 2,
        bookTitle: '1984',
        memberName: 'Jane Smith',
        issueDate: new Date('2023-06-05'),
        returnDate: null,
        rentFee: null
    },
    {
        id: 3,
        bookTitle: 'Pride and Prejudice',
        memberName: 'Alice Johnson',
        issueDate: new Date('2023-06-10'),
        returnDate: new Date('2023-06-24'),
        rentFee: 7.0
    },
    {
        id: 4,
        bookTitle: 'The Great Gatsby',
        memberName: 'Bob Wilson',
        issueDate: new Date('2023-06-15'),
        returnDate: null,
        rentFee: null
    },
    {
        id: 5,
        bookTitle: 'To Kill a Mockingbird',
        memberName: 'Emma Brown',
        issueDate: new Date('2023-06-20'),
        returnDate: new Date('2023-07-04'),
        rentFee: 7.0
    }
]

export default function TransactionsPage() {
    const [isNewTransactionOpen, setIsNewTransactionOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date>()

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Manage book loans and returns</p>
                </div>
                <Dialog open={isNewTransactionOpen} onOpenChange={setIsNewTransactionOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Transaction</DialogTitle>
                            <DialogDescription>Enter the details for the new book transaction.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="book" className="text-right">
                                    Book
                                </Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a book" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mockingbird">To Kill a Mockingbird</SelectItem>
                                        <SelectItem value="1984">1984</SelectItem>
                                        <SelectItem value="pride">Pride and Prejudice</SelectItem>
                                        <SelectItem value="gatsby">The Great Gatsby</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="member" className="text-right">
                                    Member
                                </Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="john">John Doe</SelectItem>
                                        <SelectItem value="jane">Jane Smith</SelectItem>
                                        <SelectItem value="alice">Alice Johnson</SelectItem>
                                        <SelectItem value="bob">Bob Wilson</SelectItem>
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
                                                !selectedDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Transaction</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>
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
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>{transaction.id}</TableCell>
                            <TableCell>{transaction.bookTitle}</TableCell>
                            <TableCell>{transaction.memberName}</TableCell>
                            <TableCell>{format(transaction.issueDate, 'PPP')}</TableCell>
                            <TableCell>
                                {transaction.returnDate ? format(transaction.returnDate, 'PPP') : 'Not returned'}
                            </TableCell>
                            <TableCell>{transaction.rentFee ? `$${transaction.rentFee.toFixed(2)}` : '-'}</TableCell>
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
                                        <DropdownMenuItem>View details</DropdownMenuItem>
                                        <DropdownMenuItem>Update return date</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Delete transaction</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
