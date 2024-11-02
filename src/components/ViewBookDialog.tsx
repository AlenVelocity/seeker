'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Book } from '@prisma/client'

interface ViewBookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    book?: Book
}

export function ViewBookDialog({ open, onOpenChange, book }: ViewBookDialogProps) {
    if (!book) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Book Details</DialogTitle>
                    <DialogDescription>View detailed information about this book.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]">
                    <div className="space-y-6">
                        {(book as any).imageUrl && (
                            <div className="flex justify-center">
                                <img
                                    src={(book as any).imageUrl}
                                    alt={book.title}
                                    className="h-48 w-auto rounded-md object-cover"
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{book.title}</h3>
                                <p className="text-sm text-muted-foreground">by {book.author}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">ISBN</p>
                                    <p className="text-sm text-muted-foreground">{book.isbn}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Publisher</p>
                                    <p className="text-sm text-muted-foreground">{book.publisher || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Available Copies</p>
                                    <Badge variant={book.quantity > 0 ? 'default' : 'destructive'}>
                                        {book.quantity}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Last Updated</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(book.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Added to Library</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(book.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
