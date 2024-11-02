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
    DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { UploadButton, UploadDropzone } from '@/utils/uploadthing'
import { MinusCircle, PlusCircle, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BookDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    book?: {
        id: number
        title: string
        author: string
        isbn: string
        quantity: number
        publisher?: string
        imageUrl?: string
    }
}

export function BookDialog({ open, onOpenChange, book }: BookDialogProps) {
    const [title, setTitle] = React.useState(book?.title ?? '')
    const [author, setAuthor] = React.useState(book?.author ?? '')
    const [isbn, setIsbn] = React.useState(book?.isbn ?? '')
    const [quantity, setQuantity] = React.useState(book?.quantity ?? 1)
    const [publisher, setPublisher] = React.useState(book?.publisher ?? '')
    const [imageUrl, setImageUrl] = React.useState(book?.imageUrl ?? '')

    const isFormValid = title && author && isbn && quantity && publisher && imageUrl

    const utils = api.useUtils()

    const createMutation = api.book.create.useMutation({
        onSuccess: () => {
            toast.success('Book created successfully')
            utils.book.getAll.invalidate()
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const updateMutation = api.book.update.useMutation({
        onSuccess: () => {
            toast.success('Book updated successfully')
            utils.book.getAll.invalidate()
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const data = {
            title,
            author,
            isbn,
            quantity,
            publisher,
            imageUrl
        }

        if (book) {
            updateMutation.mutate({ id: book.id, ...data })
        } else {
            createMutation.mutate(data)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                    <DialogDescription>
                        {book ? 'Update the book details below.' : 'Enter the details of the new book.'}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="isbn">ISBN</Label>
                            <Input id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <div className="flex items-center justify-center space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <span className="text-2xl font-bold">{quantity}</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publisher">Publisher</Label>
                            <Input
                                id="publisher"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cover Image</Label>
                            {imageUrl ? (
                                <div className="relative mb-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 z-10"
                                        onClick={() => setImageUrl('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <img
                                        src={imageUrl}
                                        alt="Book cover"
                                        className="h-32 w-auto rounded-md object-cover"
                                    />
                                </div>
                            ) : (
                                <UploadButton
                                    endpoint="bookImage"
                                    onClientUploadComplete={(res) => {
                                        console.log('res', res)
                                        if (res && res[0]) {
                                            setImageUrl(res[0].url)
                                            toast.success('Image uploaded successfully')
                                        }
                                    }}
                                    onUploadError={(error: Error) => {
                                        toast.error(`Failed to upload image: ${error.message}`)
                                    }}
                                />
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={!isFormValid || createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : book
                                      ? 'Save Changes'
                                      : 'Create Book'}
                            </Button>
                        </DialogFooter>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
