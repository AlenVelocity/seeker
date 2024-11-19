import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Transaction, PaginatedResponse } from '@/types/prisma'
import { logger } from '@/utils/logger'

const API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export const transactionRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(
            z.object({
                search: z.string().optional(),
                page: z.number().default(1),
                limit: z.number().default(20)
            })
        )
        .query(async ({ input }): Promise<PaginatedResponse<Transaction>> => {
            logger.info('Fetching all transactions', { input })
            const params = new URLSearchParams({
                page: input.page.toString(),
                limit: input.limit.toString()
            })
            if (input.search) params.append('search', input.search)

            const response = await fetch(`${API_URL}/api/transactions?${params}`)
            if (!response.ok) {
                logger.error('Failed to fetch transactions', { status: response.status })
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch transactions'
                })
            }
            const data = await response.json()
            logger.info('Successfully fetched transactions', { count: data.items.length })
            return data
        }),

    getById: protectedProcedure.input(z.number()).query(async ({ input }): Promise<Transaction> => {
        logger.info('Fetching transaction by ID', { id: input })
        const response = await fetch(`${API_URL}/api/transactions/${input}`)
        if (!response.ok) {
            logger.error('Transaction not found', { id: input, status: response.status })
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Transaction not found'
            })
        }
        const data = await response.json()
        logger.info('Successfully fetched transaction', { id: input })
        return data
    }),

    create: protectedProcedure
        .input(
            z.object({
                bookId: z.number(),
                memberId: z.number(),
                issueDate: z.date()
            })
        )
        .mutation(async ({ input }): Promise<Transaction> => {
            logger.info('Creating new transaction', { input })
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                const error = await response.json()
                logger.error('Failed to create transaction', { input, error })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to create transaction'
                })
            }
            const data = await response.json()
            logger.info('Successfully created transaction', { id: data.id })
            return data
        }),

    return: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                returnDate: z.date(),
                rentFee: z.number(),
                addToDebt: z.boolean().default(false)
            })
        )
        .mutation(async ({ input }): Promise<Transaction> => {
            logger.info('Creating return transaction', { input })
            const response = await fetch(`${API_URL}/api/transactions/${input.id}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    return_date: input.returnDate,
                    rent_fee: input.rentFee,
                    add_to_debt: input.addToDebt
                })
            })
            if (!response.ok) {
                const error = await response.json()
                logger.error('Failed to create return transaction', { input, error })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to return book'
                })
            }
            const data = await response.json()
            logger.info('Successfully created return transaction', { id: data.id })
            return data
        }),

    getMonthlyData: protectedProcedure.query(async () => {
        logger.info('Fetching monthly transaction data')
        const response = await fetch(`${API_URL}/api/transactions/monthly-data`)
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
    }),

    getRecent: protectedProcedure.input(z.object({ limit: z.number().default(5) })).query(async ({ input }) => {
        logger.info('Fetching recent transactions', { limit: input.limit })
        const response = await fetch(`${API_URL}/api/transactions/recent?limit=${input.limit}`)
        if (!response.ok) {
            logger.error('Failed to fetch recent transactions', { status: response.status })
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch recent transactions'
            })
        }
        const data = await response.json()
        logger.info('Successfully fetched recent transactions')
        return data
    }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }): Promise<Transaction> => {
        logger.info('Deleting transaction', { id: input })
        const response = await fetch(`${API_URL}/api/transactions/${input}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            logger.error('Failed to delete transaction', { id: input, status: response.status })
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to delete transaction'
            })
        }
        const data = await response.json()
        logger.info('Successfully deleted transaction', { id: input })
        return data
    })
})
