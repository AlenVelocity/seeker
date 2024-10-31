'use client'

import * as React from 'react'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Mock data based on the schema
const members = [
    { id: 1, name: 'John Doe', email: 'john@example.com', outstandingDebt: 0, createdAt: new Date('2023-01-15') },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', outstandingDebt: 5.5, createdAt: new Date('2023-02-20') },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', outstandingDebt: 0, createdAt: new Date('2023-03-10') },
    { id: 4, name: 'Bob Wilson', email: 'bob@example.com', outstandingDebt: 2.75, createdAt: new Date('2023-04-05') },
    { id: 5, name: 'Emma Brown', email: 'emma@example.com', outstandingDebt: 0, createdAt: new Date('2023-05-12') }
]

export default function MembersPage() {
    const [isNewMemberOpen, setIsNewMemberOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState('')

    const filteredMembers = members.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Members</h1>
                    <p className="text-muted-foreground">Manage library members</p>
                </div>
                <Dialog open={isNewMemberOpen} onOpenChange={setIsNewMemberOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
                            <DialogDescription>Enter the details for the new library member.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input id="name" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input id="email" type="email" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Member</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button type="submit">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Outstanding Debt</TableHead>
                        <TableHead>Member Since</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>${member.outstandingDebt.toFixed(2)}</TableCell>
                            <TableCell>{member.createdAt.toLocaleDateString()}</TableCell>
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
                                        <DropdownMenuItem>Edit member</DropdownMenuItem>
                                        <DropdownMenuItem>View transaction history</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Delete member</DropdownMenuItem>
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
