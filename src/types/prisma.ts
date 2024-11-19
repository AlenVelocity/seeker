export type Book = {
    id: number
    title: string
    author: string
    isbn: string
    quantity: number
    publisher?: string | null
    createdAt: Date
    updatedAt: Date
}

export type Member = {
    id: number
    name: string
    email: string
    address?: string | null
    outstandingDebt: number
    createdAt: Date
    updatedAt: Date
    transactions: Transaction[]
}

export type TransactionType = 'ISSUE' | 'RETURN'

export type Transaction = {
    id: number
    type: TransactionType
    bookId: number
    memberId: number
    issueDate: Date
    returnDate?: Date | null
    rentFee?: number | null
    relatedTransactionId?: number | null
    relatedTransaction?: Transaction | null
    returnTransaction?: Transaction | null
    createdAt: Date
    updatedAt: Date
    book: Book
    member: Member
}

export type PaginatedResponse<T> = {
    items: T[]
    total: number
    page: number
    size: number
    pages: number
}

export type FrappeBook = {
    title: string
    authors: string
    isbn: string
    publisher?: string
    publication_date?: string
}

export type MonthlyData = {
    name: string
    loans: number
    returns: number
}
