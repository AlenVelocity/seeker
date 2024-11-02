import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Transaction, PaginatedResponse } from '@/types/prisma'

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
            const params = new URLSearchParams({
                page: input.page.toString(),
                limit: input.limit.toString()
            })
            if (input.search) params.append('search', input.search)

            const response = await fetch(`${API_URL}/api/transactions?${params}`)
            if (!response.ok) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch transactions'
                })
            }
            return response.json()
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
            console.log(input)
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                const error = await response.json()
                console.log(error.detail)
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to create transaction'
                })
            }
            return response.json()
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
            const response = await fetch(`${API_URL}/api/transactions/${input.id}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    return_date: input.returnDate,
                    add_to_debt: input.addToDebt,
                    rent_fee: input.rentFee
                })
            })
            if (!response.ok) {
                const error = await response.json()
                console.log(error.detail)
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to return book'
                })
            }
            return response.json()
        }),

    payRentFee: protectedProcedure
        .input(
            z.object({
                transactionId: z.number()
            })
        )
        .mutation(async ({ input }): Promise<Transaction> => {
            const response = await fetch(`${API_URL}/api/transactions/${input.transactionId}/pay-fee`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) {
                const error = await response.json()
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to pay rent fee'
                })
            }
            return response.json()
        }),

    getMonthlyData: protectedProcedure.query(async () => {
        const response = await fetch(`${API_URL}/api/transactions/monthly-data`)
        if (!response.ok) {
            const error = await response.json()
            console.log(error)
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch monthly data'
            })
        }
        const data = await response.json()
        console.log(data)
        return data
    }),

    getRecent: protectedProcedure.input(z.object({ limit: z.number().default(5) })).query(async ({ input }) => {
        const response = await fetch(`${API_URL}/api/transactions/recent?limit=${input.limit}`)
        if (!response.ok) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch recent transactions'
            })
        }
        const data = await response.json()
        console.log(data)
        return data
    }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }): Promise<Transaction> => {
        const response = await fetch(`${API_URL}/api/transactions/${input}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Failed to delete transaction'
            })
        }
        return response.json()
    })
})
