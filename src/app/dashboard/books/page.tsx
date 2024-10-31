'use client'

import * as React from 'react'
import { Book, Search, Plus, MinusCircle, PlusCircle, Grid, List } from 'lucide-react'
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

// Mock data for books based on the schema
const books = [
    {
        id: 1,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780446310789',
        quantity: 5,
        publisher: 'J. B. Lippincott & Co.',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-06-20')
    },
    {
        id: 2,
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        quantity: 3,
        publisher: 'Secker & Warburg',
        createdAt: new Date('2023-02-10'),
        updatedAt: new Date('2023-07-05')
    },
    {
        id: 3,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        quantity: 4,
        publisher: "Charles Scribner's Sons",
        createdAt: new Date('2023-03-22'),
        updatedAt: new Date('2023-08-12')
    },
    {
        id: 4,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '9780141439518',
        quantity: 2,
        publisher: 'T. Egerton, Whitehall',
        createdAt: new Date('2023-04-05'),
        updatedAt: new Date('2023-09-01')
    },
    {
        id: 5,
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '9780316769174',
        quantity: 6,
        publisher: 'Little, Brown and Company',
        createdAt: new Date('2023-05-18'),
        updatedAt: new Date('2023-10-15')
    },
    {
        id: 6,
        title: 'One Hundred Years of Solitude',
        author: 'Gabriel García Márquez',
        isbn: '9780060883287',
        quantity: 3,
        publisher: 'Harper & Row',
        createdAt: new Date('2023-06-30'),
        updatedAt: new Date('2023-11-22')
    },
    {
        id: 7,
        title: 'Brave New World',
        author: 'Aldous Huxley',
        isbn: '9780060850524',
        quantity: 4,
        publisher: 'Chatto & Windus',
        createdAt: new Date('2023-07-14'),
        updatedAt: new Date('2023-12-05')
    },
    {
        id: 8,
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780261102217',
        quantity: 7,
        publisher: 'George Allen & Unwin',
        createdAt: new Date('2023-08-25'),
        updatedAt: new Date('2024-01-10')
    },
    {
        id: 9,
        title: 'Fahrenheit 451',
        author: 'Ray Bradbury',
        isbn: '9781451673319',
        quantity: 5,
        publisher: 'Ballantine Books',
        createdAt: new Date('2023-09-09'),
        updatedAt: new Date('2024-02-18')
    },
    {
        id: 10,
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        isbn: '9780618640157',
        quantity: 8,
        publisher: 'Allen & Unwin',
        createdAt: new Date('2023-10-20'),
        updatedAt: new Date('2024-03-25')
    }
]

export default function BooksPage() {
    const [activeTab, setActiveTab] = React.useState('list')
    const [searchTerm, setSearchTerm] = React.useState('')
    const [currentPage, setCurrentPage] = React.useState(1)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [selectedBook, setSelectedBook] = React.useState<(typeof books)[0] | null>(null)
    const [importQuantity, setImportQuantity] = React.useState(1)
    const [listViewMode, setListViewMode] = React.useState('table')
    const booksPerPage = 12

    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.isbn.includes(searchTerm)
    )

    const indexOfLastBook = currentPage * booksPerPage
    const indexOfFirstBook = indexOfLastBook - booksPerPage
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    const handleImport = (book: (typeof books)[0]) => {
        setSelectedBook(book)
        setImportQuantity(1)
        setImportDialogOpen(true)
    }

    const confirmImport = () => {
        // Here you would typically update the database
        console.log(`Importing ${importQuantity} copies of "${selectedBook?.title}"`)
        setImportDialogOpen(false)
    }

    return (
        <div className="container mx-auto py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Book Management</h1>
                <p className="text-muted-foreground">Manage your library inventory</p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                                onValueChange={(value) => value && setListViewMode(value)}
                            >
                                <ToggleGroupItem value="table" aria-label="View as table">
                                    <List className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="grid" aria-label="View as grid">
                                    <Grid className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <Button>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book.id}>
                                        <TableCell className="font-medium">{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.isbn}</TableCell>
                                        <TableCell>{book.quantity}</TableCell>
                                        <TableCell>{book.publisher}</TableCell>
                                        <TableCell>{book.updatedAt.toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {books.map((book) => (
                                <Card key={book.id} className="flex flex-col justify-between">
                                    <CardContent className="pt-4">
                                        <div className="relative mb-2 aspect-[3/4]">
                                            <Image
                                                src={`/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.title)}`}
                                                alt={book.title}
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded-md"
                                            />
                                        </div>
                                        <div className="line-clamp-1 text-sm font-semibold" title={book.title}>
                                            {book.title}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">{book.author}</div>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-xs">
                                                Qty: {book.quantity}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {book.updatedAt.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="import" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Import Books</h2>
                        <div className="flex items-center space-x-2">
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
                        {currentBooks.map((book) => (
                            <Card key={book.id} className="flex flex-col justify-between">
                                <CardContent className="pt-4">
                                    <div className="relative mb-2 aspect-[3/4]">
                                        <Image
                                            src={`/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.title)}`}
                                            alt={book.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-md"
                                        />
                                    </div>
                                    <div className="line-clamp-1 text-sm font-semibold" title={book.title}>
                                        {book.title}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">{book.author}</div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <Badge variant="secondary" className="text-xs">
                                            Qty: {book.quantity}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {book.updatedAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button size="sm" className="w-full" onClick={() => handleImport(book)}>
                                        <Book className="mr-2 h-3 w-3" />
                                        Import
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-center space-x-2">
                        {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, i) => (
                            <Button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                variant={currentPage === i + 1 ? 'default' : 'outline'}
                                size="sm"
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
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
                        <Button onClick={confirmImport}>Confirm Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
