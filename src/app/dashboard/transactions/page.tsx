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
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { IssueBookDialog } from '@/components/IssueBookDialog'
import { Badge } from '@/components/ui/badge'
import { LoadingCell } from '@/components/ui/loading-cell'
import { ReturnBookDialog } from '@/components/ReturnBookDialog'
import { Transaction } from '@/types/prisma'

export default function TransactionsPage() {
    const [isIssueDialogOpen, setIsIssueDialogOpen] = React.useState(false)
    const [isReturnDialogOpen, setIsReturnDialogOpen] = React.useState(false)
    const [selectedTransaction, setSelectedTransaction] = React.useState<number | null>(null)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)

    const utils = api.useUtils()

    // Queries
    const transactionsQuery = api.transaction.getAll.useQuery({
        search: searchTerm,
        page: currentPage,
        limit: 20
    })

    // Mutations
    const deleteMutation = api.transaction.delete.useMutation({
        onSuccess: () => {
            toast.success('Transaction deleted successfully')
            utils.transaction.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const getTransactionStatus = (transaction: Transaction) => {
        if (transaction.type === 'RETURN') {
            return <Badge variant="secondary">Return Transaction</Badge>
        }
        return transaction.returnTransaction ? (
            <Badge variant="secondary">Returned</Badge>
        ) : (
            <Badge variant="default">Active</Badge>
        )
    }

    const getTransactionType = (type: 'ISSUE' | 'RETURN') => {
        return <Badge variant={type === 'ISSUE' ? 'default' : 'secondary'}>{type}</Badge>
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
                <Button onClick={() => setIsIssueDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Issue Book
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Book</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rent Fee</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactionsQuery.isLoading ? (
                        <TableRow>
                            <LoadingCell colSpan={8} />
                        </TableRow>
                    ) : transactionsQuery.data?.items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactionsQuery.data?.items.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.id}</TableCell>
                                <TableCell>{getTransactionType(transaction.type)}</TableCell>
                                <TableCell>{transaction.book.title}</TableCell>
                                <TableCell>{transaction.member.name}</TableCell>
                                <TableCell>{format(new Date(transaction.issueDate), 'PPP')}</TableCell>
                                <TableCell>{getTransactionStatus(transaction)}</TableCell>
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
                                            {transaction.type === 'ISSUE' && !transaction.returnTransaction && (
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

            <IssueBookDialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen} />

            <ReturnBookDialog
                open={isReturnDialogOpen}
                onOpenChange={setIsReturnDialogOpen}
                transactionId={selectedTransaction}
            />
        </div>
    )
}
