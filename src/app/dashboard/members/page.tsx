'use client'

import * as React from 'react'
import { Plus, Search, MoreHorizontal, DollarSign } from 'lucide-react'
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
    DialogTitle,
    DialogTrigger
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

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [isNewMemberOpen, setIsNewMemberOpen] = React.useState(false)
    const [isPaymentOpen, setIsPaymentOpen] = React.useState(false)
    const [selectedMember, setSelectedMember] = React.useState<number | null>(null)
    const [paymentAmount, setPaymentAmount] = React.useState('')
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        address: ''
    })

    const debouncedSearch = useDebounce(searchTerm, 500)
    const utils = api.useUtils()

    // Queries
    const membersQuery = api.member.getAll.useQuery({
        search: debouncedSearch,
        page: currentPage
    })

    // Mutations
    const createMutation = api.member.create.useMutation({
        onSuccess: () => {
            toast.success('Member created successfully')
            setIsNewMemberOpen(false)
            setFormData({ name: '', email: '', address: '' })
            utils.member.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

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

    const handleCreate = () => {
        if (!formData.name || !formData.email) {
            toast.error('Please fill in all required fields')
            return
        }

        createMutation.mutate(formData)
    }

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
                <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Dialog open={isNewMemberOpen} onOpenChange={setIsNewMemberOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Member</DialogTitle>
                            <DialogDescription>Enter the details for the new member.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Member'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Active Loans</TableHead>
                        <TableHead>Outstanding Debt</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {membersQuery.data?.members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                <Badge variant={member.transactions.length > 0 ? 'default' : 'secondary'}>
                                    {member.transactions.length}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {member.outstandingDebt > 0 ? (
                                    <Badge variant="destructive">${member.outstandingDebt.toFixed(2)}</Badge>
                                ) : (
                                    <Badge variant="secondary">$0.00</Badge>
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
                    ))}
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
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="pl-7"
                                        step="0.01"
                                        min="0"
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
        </div>
    )
}
