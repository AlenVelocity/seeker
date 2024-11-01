import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

interface ManageDebtDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    memberId: number
    currentDebt: number
}

export function ManageDebtDialog({ open, onOpenChange, memberId, currentDebt }: ManageDebtDialogProps) {
    const [amount, setAmount] = React.useState('')
    const utils = api.useUtils()

    const payDebtMutation = api.member.payDebt.useMutation({
        onSuccess: () => {
            toast.success('Payment processed successfully')
            onOpenChange(false)
            setAmount('')
            utils.member.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const clearDebtMutation = api.member.clearDebt.useMutation({
        onSuccess: () => {
            toast.success('Debt cleared successfully')
            onOpenChange(false)
            utils.member.getAll.invalidate()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setAmount(value)
        }
    }

    const handlePayment = () => {
        if (!amount) {
            toast.error('Please enter an amount')
            return
        }

        payDebtMutation.mutate({
            id: memberId,
            amount: parseFloat(amount)
        })
    }

    const handleClearDebt = () => {
        clearDebtMutation.mutate(memberId)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Debt</DialogTitle>
                    <DialogDescription>Current outstanding debt: ₹{currentDebt.toFixed(2)}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Payment Amount
                        </Label>
                        <div className="col-span-3">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                <Input
                                    id="amount"
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="pl-7"
                                    placeholder="0.00"
                                    max={currentDebt}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button
                        variant="destructive"
                        onClick={handleClearDebt}
                        disabled={clearDebtMutation.isPending || currentDebt === 0}
                    >
                        Clear Full Debt
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={
                            payDebtMutation.isPending ||
                            !amount ||
                            parseFloat(amount) === 0 ||
                            parseFloat(amount) > currentDebt
                        }
                    >
                        {payDebtMutation.isPending ? 'Processing...' : 'Process Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
