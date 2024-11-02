'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Member } from '@/types/prisma'
import { Badge } from '@/components/ui/badge'
import { Pencil, X } from 'lucide-react'

interface MemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member?: Member
}

export function MemberDialog({ open, onOpenChange, member }: MemberDialogProps) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [name, setName] = React.useState(member?.name ?? '')
    const [email, setEmail] = React.useState(member?.email ?? '')
    const [address, setAddress] = React.useState(member?.address ?? '')

    React.useEffect(() => {
        if (member) {
            setName(member.name)
            setEmail(member.email)
            setAddress(member.address ?? '')
        } else {
            setIsEditing(true) // If no member, we're creating
            setName('')
            setEmail('')
            setAddress('')
        }
    }, [member])

    const isFormValid = name && email

    const utils = api.useUtils()

    const createMutation = api.member.create.useMutation({
        onSuccess: () => {
            toast.success('Member created successfully')
            utils.member.getAll.invalidate()
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateMutation = api.member.update.useMutation({
        onSuccess: () => {
            toast.success('Member updated successfully')
            utils.member.getAll.invalidate()
            setIsEditing(false)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const data = {
            name,
            email,
            address
        }

        if (member) {
            updateMutation.mutate({ id: member.id, ...data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleClose = () => {
        setIsEditing(false)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{member ? 'Member Details' : 'Add New Member'}</DialogTitle>
                        {member && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(!isEditing)}
                                className="h-8 w-8"
                            >
                                {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                    <DialogDescription>
                        {member
                            ? isEditing
                                ? 'Edit member details below.'
                                : 'View member information.'
                            : 'Enter the details of the new member.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            {isEditing ? (
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            ) : (
                                <div className="rounded-md border px-3 py-2">{member?.name}</div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            ) : (
                                <div className="rounded-md border px-3 py-2">{member?.email}</div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            {isEditing ? (
                                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            ) : (
                                <div className="rounded-md border px-3 py-2">{member?.address || 'Not provided'}</div>
                            )}
                        </div>
                        {member && !isEditing && (
                            <>
                                <div className="space-y-2">
                                    <Label>Active Loans</Label>
                                    <div>
                                        <Badge variant={member.transactions.length > 0 ? 'default' : 'secondary'}>
                                            {member.transactions.length} active loans
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Outstanding Debt</Label>
                                    <div>
                                        {member.outstandingDebt > 0 ? (
                                            <Badge variant="destructive">₹{member.outstandingDebt.toFixed(2)}</Badge>
                                        ) : (
                                            <Badge variant="secondary">₹0.00</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Member Since</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </>
                        )}
                        {isEditing && (
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
                                >
                                    {createMutation.isPending || updateMutation.isPending
                                        ? 'Saving...'
                                        : member
                                          ? 'Save Changes'
                                          : 'Create Member'}
                                </Button>
                            </DialogFooter>
                        )}
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
