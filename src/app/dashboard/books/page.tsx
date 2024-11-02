'use client'

import * as React from 'react'
import { Book, Search, Plus, MinusCircle, PlusCircle, Grid, List, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { IssueBookDialog } from '@/components/IssueBookDialog'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination'
import { LoadingCell, LoadingCells } from '@/components/ui/loading-cell'
import { Skeleton } from '@/components/ui/skeleton'

type Book = {
    id: number
    title: string
    author: string
    isbn: string
    quantity: number
    publisher: string
    updatedAt: string
}

type FrappeBook = {
    bookID: string
    title: string
    authors: string
    isbn: string
    publisher: string
    publication_date: string
}

export default function BooksPage() {
    const [activeTab, setActiveTab] = React.useState<'list' | 'import'>('list')
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [selectedBook, setSelectedBook] = React.useState<FrappeBook | null>(null)
    const [importQuantity, setImportQuantity] = React.useState(1)
    const [listViewMode, setListViewMode] = React.useState<'table' | 'grid'>('table')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [isIssueDialogOpen, setIsIssueDialogOpen] = React.useState(false)
    const [selectedBookForIssue, setSelectedBookForIssue] = React.useState<number | null>(null)

    const booksQuery = api.book.getAll.useQuery({
        search: debouncedSearch,
        page: currentPage,
        limit: 12
    })

    const frappeQuery = api.book.searchFromFrappe.useQuery(
        {
            title: debouncedSearch,
            page: currentPage
        },
        {
            enabled: activeTab === 'import'
        }
    )

    const books = activeTab === 'list' ? booksQuery.data?.items : frappeQuery.data || []
    const totalPages =
        activeTab === 'list' ? booksQuery.data?.pages || 1 : Math.ceil((frappeQuery.data?.length || 0) / 12)

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber)
    }

    const handleImport = (book: FrappeBook) => {
        setSelectedBook(book)
        setImportQuantity(1)
        setImportDialogOpen(true)
    }

    const importBookMutation = api.book.importBook.useMutation({
        onSuccess: () => {
            toast.success('Book imported successfully')
            setImportDialogOpen(false)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const importAllMutation = api.book.importMultipleBooks.useMutation({
        onSuccess: (data) => {
            toast.success(`Imported ${data.imported} out of ${data.total} books`)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const confirmImport = () => {
        if (!selectedBook) return

        importBookMutation.mutate({
            title: selectedBook.title,
            author: selectedBook.authors,
            isbn: selectedBook.isbn,
            publisher: selectedBook.publisher,
            quantity: importQuantity
        })
    }

    const handleImportAll = () => {
        const booksToImport = (books as FrappeBook[]).map((book) => ({
            title: book.title,
            author: book.authors,
            isbn: book.isbn,
            publisher: book.publisher,
            quantity: importQuantity
        }))

        importAllMutation.mutate(booksToImport)
    }

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Book Management</h1>
                <p className="text-muted-foreground">Manage your library inventory</p>
            </header>

            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'list' | 'import')}
                className="space-y-4"
            >
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                    <TabsTrigger
                        value="list"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                        List
                    </TabsTrigger>
                    <TabsTrigger
                        value="import"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                    >
                        Import
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-2xl font-bold">Book List</h2>
                            <ToggleGroup
                                type="single"
                                value={listViewMode}
                                onValueChange={(value) => value && setListViewMode(value as 'table' | 'grid')}
                            >
                                <ToggleGroupItem value="table" aria-label="View as table">
                                    <List className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="grid" aria-label="View as grid">
                                    <Grid className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <Button disabled>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Book
                        </Button>
                    </div>
                    {listViewMode === 'table' ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>ISBN</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Publisher</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {booksQuery.isLoading ? (
                                    <TableRow>
                                        <LoadingCell />
                                    </TableRow>
                                ) : booksQuery.data?.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No books found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    booksQuery.data?.items.map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell className="font-medium">{book.title}</TableCell>
                                            <TableCell>{book.author}</TableCell>
                                            <TableCell>{book.isbn}</TableCell>
                                            <TableCell>{book.quantity}</TableCell>
                                            <TableCell>{book.publisher}</TableCell>
                                            <TableCell>{new Date(book.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    disabled={book.quantity < 1}
                                                    onClick={() => {
                                                        setSelectedBookForIssue(book.id)
                                                        setIsIssueDialogOpen(true)
                                                    }}
                                                >
                                                    Issue
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {booksQuery.isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i} className="flex h-[400px] flex-col justify-between">
                                        <CardContent className="flex flex-col items-center justify-center p-4">
                                            <Skeleton className="h-48 w-full" />
                                            <Skeleton className="mt-2 h-4 w-full" />
                                            <Skeleton className="mt-2 h-4 w-2/3" />
                                        </CardContent>
                                        <CardFooter className="p-4 pt-2">
                                            <Skeleton className="h-9 w-full" />
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : booksQuery.data?.items.length === 0 ? (
                                <div className="col-span-full text-center text-muted-foreground">No books found.</div>
                            ) : (
                                booksQuery.data?.items.map((book) => (
                                    <Card key={book.id} className="flex h-[400px] flex-col justify-between">
                                        <CardContent className="flex flex-col justify-between p-4">
                                            <div>
                                                <div className="relative mb-2 aspect-[3/4] h-48">
                                                    <Image
                                                        src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                                                        alt={book.title}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="rounded-md"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.title)}`
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    className="line-clamp-2 h-12 text-sm font-semibold"
                                                    title={book.title}
                                                >
                                                    {book.title}
                                                </div>
                                                <div className="mt-1 h-6 text-xs text-muted-foreground">
                                                    {book.author}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <Badge variant="secondary" className="text-xs">
                                                    Qty: {book.quantity}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(book.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-2">
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                disabled={book.quantity < 1}
                                                onClick={() => {
                                                    setSelectedBookForIssue(book.id)
                                                    setIsIssueDialogOpen(true)
                                                }}
                                            >
                                                Issue
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="import" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Import Books</h2>
                        <div className="flex items-center space-x-2">
                            <Button onClick={handleImportAll} disabled={importAllMutation.isPending}>
                                <Plus className="mr-2 h-4 w-4" />
                                Import All
                            </Button>
                            <Input
                                type="text"
                                placeholder="Search books..."
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
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {frappeQuery.isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="flex h-[400px] flex-col justify-between">
                                    <CardContent className="flex flex-col items-center justify-center p-4">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="mt-2 h-4 w-full" />
                                        <Skeleton className="mt-2 h-4 w-2/3" />
                                    </CardContent>
                                    <CardFooter className="p-4 pt-2">
                                        <Skeleton className="h-9 w-full" />
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (books as FrappeBook[])?.length === 0 ? (
                            <div className="col-span-full text-center text-muted-foreground">No books found.</div>
                        ) : (
                            (books as FrappeBook[])?.map((book) => (
                                <Card key={book.bookID} className="flex h-[400px] flex-col justify-between">
                                    <CardContent className="flex flex-col justify-between p-4">
                                        <div>
                                            <div className="relative mb-2 aspect-[3/4] h-48">
                                                <Image
                                                    src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                                                    alt={book.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded-md"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.title)}`
                                                    }}
                                                />
                                            </div>
                                            <div className="line-clamp-2 h-12 text-sm font-semibold" title={book.title}>
                                                {book.title}
                                            </div>
                                            <div className="mt-1 h-6 text-xs text-muted-foreground">{book.authors}</div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                {book.isbn}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {book.publication_date}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-2">
                                        <Button size="sm" className="w-full" onClick={() => handleImport(book)}>
                                            <Book className="mr-2 h-3 w-3" />
                                            Import
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => paginate(currentPage - 1)}
                                    tabIndex={currentPage === 1 ? -1 : 0}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink>{currentPage}</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => {
                                        if ((books as FrappeBook[]).length > 0) {
                                            paginate(currentPage + 1)
                                        } else if (currentPage > 1) {
                                            paginate(currentPage - 1)
                                        }
                                    }}
                                    tabIndex={
                                        (books ?? ([] as FrappeBook[])).length === 0 && currentPage === 1 ? -1 : 0
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </TabsContent>
            </Tabs>

            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Book</DialogTitle>
                        <DialogDescription>
                            Specify the quantity of "{selectedBook?.title}" to import.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center space-x-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setImportQuantity(Math.max(1, importQuantity - 1))}
                        >
                            <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold">{importQuantity}</span>
                        <Button variant="outline" size="icon" onClick={() => setImportQuantity(importQuantity + 1)}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmImport} disabled={importBookMutation.isPending}>
                            {importBookMutation.isPending ? 'Importing...' : 'Confirm Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <IssueBookDialog
                open={isIssueDialogOpen}
                onOpenChange={setIsIssueDialogOpen}
                preselectedBook={
                    selectedBookForIssue
                        ? booksQuery.data?.items.find((book) => book.id === selectedBookForIssue)
                        : undefined
                }
            />
        </div>
    )
}
