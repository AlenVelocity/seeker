'use client'

import * as React from 'react'
import { Plus, Search, MoreHorizontal, DollarSign, UserPlus } from 'lucide-react'
import { api } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'
import { LoadingCell, LoadingCells } from '@/components/ui/loading-cell'
import { MemberDialog } from '@/components/MemberDialog'
import { Member } from '@prisma/client'

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)
    const [selectedMember, setSelectedMember] = React.useState<number | null>(null)
    const [paymentAmount, setPaymentAmount] = React.useState('')
    const [isMemberDialogOpen, setIsMemberDialogOpen] = React.useState(false)
    const [selectedMemberForEdit, setSelectedMemberForEdit] = React.useState<{
        id: number
        name: string
        email: string
        address?: string
        outstandingDebt: number
    } | null>(null)

    const debouncedSearch = useDebounce(searchTerm, 500)
    const utils = api.useUtils()

    // Queries
    const membersQuery = api.member.getAll.useQuery({
        search: debouncedSearch,
        page: currentPage,
        limit: 20
    })

    // Mutations
    const deleteMutation = api.member.delete.useMutation({
        onSuccess: () => {
            toast.success('Member deleted successfully')
            utils.member.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const payDebtMutation = api.member.payDebt.useMutation({
        onSuccess: () => {
            toast.success('Payment processed successfully')
            setIsPaymentOpen(false)
            setPaymentAmount('')
            utils.member.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handlePayment = () => {
        if (!selectedMember || !paymentAmount) {
            toast.error('Please enter a payment amount')
            return
        }

        payDebtMutation.mutate({
            id: selectedMember,
            amount: parseFloat(paymentAmount)
        })
    }

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Members</h1>
                <p className="text-muted-foreground">Manage library members</p>
            </header>

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={() => setIsMemberDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    New Member
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Active Loans</TableHead>
                        <TableHead>Outstanding Debt</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {membersQuery.isLoading ? (
                        <TableRow>
                            <LoadingCells columns={5} />
                        </TableRow>
                    ) : membersQuery.data?.items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No members found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        membersQuery.data?.items.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="font-medium">{member.name}</div>
                                            <div className="text-sm text-muted-foreground">ID: {member.id}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-sm">{member.email}</div>
                                        {member.address && (
                                            <div className="text-sm text-muted-foreground">{member.address}</div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.transactions.length > 0 ? 'default' : 'secondary'}>
                                        {member.transactions.length}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {member.outstandingDebt > 0 ? (
                                        <Badge variant="destructive">₹{member.outstandingDebt.toFixed(2)}</Badge>
                                    ) : (
                                        <Badge variant="secondary">₹0.00</Badge>
                                    )}
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
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedMemberForEdit(member as any)
                                                    setIsMemberDialogOpen(true)
                                                }}
                                            >
                                                View details
                                            </DropdownMenuItem>
                                            {member.outstandingDebt > 0 && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedMember(member.id)
                                                        setIsPaymentOpen(true)
                                                    }}
                                                >
                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                    Pay Debt
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => deleteMutation.mutate(member.id)}
                                                disabled={member.transactions.length > 0 || member.outstandingDebt > 0}
                                            >
                                                Delete member
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                        <DialogDescription>Enter the payment amount.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <div className="col-span-3">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                    <Input
                                        id="amount"
                                        type="text"
                                        value={paymentAmount}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                setPaymentAmount(value)
                                            }
                                        }}
                                        className="pl-7"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handlePayment} disabled={payDebtMutation.isPending}>
                            {payDebtMutation.isPending ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MemberDialog
                open={isMemberDialogOpen}
                onOpenChange={(open) => {
                    setIsMemberDialogOpen(open)
                    if (!open) setSelectedMemberForEdit(null)
                }}
                member={selectedMemberForEdit as any}
            />
        </div>
    )
}
