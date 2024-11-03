import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Book, PaginatedResponse, FrappeBook, MonthlyData } from '@/types/prisma'
import { logger } from '@/utils/logger'

const API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export const bookRouter = createTRPCRouter({
    getById: protectedProcedure.input(z.number()).query(async ({ input }): Promise<Book> => {
        logger.info('Fetching book by ID', { id: input })
        const response = await fetch(`${API_URL}/api/books/${input}`)
        if (!response.ok) {
            logger.error('Book not found', { id: input, status: response.status })
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Book not found'
            })
        }
        const data = await response.json()
        logger.info('Successfully fetched book', { id: input })
        return data
    }),

    getAll: protectedProcedure
        .input(
            z.object({
                search: z.string().optional(),
                page: z.number().default(1),
                limit: z.number().default(20)
            })
        )
        .query(async ({ input }): Promise<PaginatedResponse<Book>> => {
            logger.info('Fetching all books', { input })
            const params = new URLSearchParams({
                page: input.page.toString(),
                limit: input.limit.toString()
            })
            if (input.search) params.append('search', input.search)

            const response = await fetch(`${API_URL}/api/books?${params}`)
            if (!response.ok) {
                logger.error('Failed to fetch books', { status: response.status })
                const error = await response.json()
                console.log(error)
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch books'
                })
            }
            const data = await response.json()
            logger.info('Successfully fetched books', { count: data.items.length })
            return data
        }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                author: z.string(),
                isbn: z.string(),
                quantity: z.number().min(0),
                publisher: z.string().optional(),
                imageUrl: z.string().optional()
            })
        )
        .mutation(async ({ input }): Promise<Book> => {
            logger.info('Creating new book', { input })
            const response = await fetch(`${API_URL}/api/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                logger.error('Failed to create book', { input, status: response.status })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Failed to create book'
                })
            }
            const data = await response.json()
            logger.info('Successfully created book', { id: data.id })
            return data
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                title: z.string().optional(),
                author: z.string().optional(),
                isbn: z.string().optional(),
                quantity: z.number().min(0).optional(),
                publisher: z.string().optional(),
                imageUrl: z.string().optional()
            })
        )
        .mutation(async ({ input }): Promise<Book> => {
            logger.info('Updating book', { id: input.id, input })
            const { id, ...data } = input
            const response = await fetch(`${API_URL}/api/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                logger.error('Failed to update book', { id, status: response.status })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Failed to update book'
                })
            }
            const updatedBook = await response.json()
            logger.info('Successfully updated book', { id })
            return updatedBook
        }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }): Promise<Book> => {
        logger.info('Deleting book', { id: input })
        const response = await fetch(`${API_URL}/api/books/${input}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            logger.error('Failed to delete book', { id: input, status: response.status })
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to delete book'
            })
        }
        const deletedBook = await response.json()
        logger.info('Successfully deleted book', { id: input })
        return deletedBook
    }),

    searchFromFrappe: protectedProcedure
        .input(
            z.object({
                title: z.string().optional(),
                authors: z.string().optional(),
                isbn: z.string().optional(),
                publisher: z.string().optional(),
                page: z.number().default(1)
            })
        )
        .query(async ({ input }): Promise<FrappeBook[]> => {
            logger.info('Searching books from Frappe API', { input })
            const params = new URLSearchParams()
            if (input.title) params.append('title', input.title)
            if (input.authors) params.append('authors', input.authors)
            if (input.isbn) params.append('isbn', input.isbn)
            if (input.publisher) params.append('publisher', input.publisher)
            params.append('page', input.page.toString())

            const response = await fetch(`${API_URL}/api/books/search/frappe?${params}`)
            if (!response.ok) {
                logger.error('Failed to fetch books from Frappe API', { status: response.status })
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch books from Frappe API'
                })
            }
            const data = await response.json()
            logger.info('Successfully fetched books from Frappe API', { count: data.length })
            return data
        }),

    getOverview: protectedProcedure.query(async () => {
        logger.info('Fetching book overview')
        const response = await fetch(`${API_URL}/api/books/overview`)
        if (!response.ok) {
            const error = await response.json()
            console.log(error)
            logger.error('Failed to fetch overview data', { status: response.status })
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch overview data'
            })
        }
        const data = await response.json()
        console.log(data)
        logger.info('Successfully fetched book overview')
        return data
    }),

    importBook: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                author: z.string(),
                isbn: z.string(),
                quantity: z.number().min(1),
                publisher: z.string().optional()
            })
        )
        .mutation(async ({ input }): Promise<Book> => {
            const response = await fetch(`${API_URL}/api/books/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Failed to import book'
                })
            }
            return response.json()
        }),

    importMultipleBooks: protectedProcedure
        .input(
            z.array(
                z.object({
                    title: z.string(),
                    author: z.string(),
                    isbn: z.string(),
                    quantity: z.number().min(1),
                    publisher: z.string().optional()
                })
            )
        )
        .mutation(async ({ input }): Promise<{ imported: number; total: number }> => {
            const response = await fetch(`${API_URL}/api/books/import-multiple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Failed to import books'
                })
            }
            return response.json()
        }),

    getMonthlyData: protectedProcedure.query(async (): Promise<MonthlyData[]> => {
        logger.info('Fetching monthly data')
        const response = await fetch(`${API_URL}/api/books/monthly-data`)
        if (!response.ok) {
            logger.error('Failed to fetch monthly data', { status: response.status })
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch monthly data'
            })
        }
        const data = await response.json()
        logger.info('Successfully fetched monthly data')
        return data
    })
})
