import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Member, PaginatedResponse } from '@/types/prisma'
import { logger } from '@/utils/logger' // Assuming you have a logger utility

const API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export const memberRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(
            z.object({
                search: z.string().optional(),
                page: z.number().default(1),
                limit: z.number().default(20)
            })
        )
        .query(async ({ input }): Promise<PaginatedResponse<Member>> => {
            logger.info('Fetching all members', { input })
            const params = new URLSearchParams({
                page: input.page.toString(),
                limit: input.limit.toString()
            })
            if (input.search) params.append('search', input.search)

            const response = await fetch(`${API_URL}/api/members?${params}`)
            if (!response.ok) {
                logger.error('Failed to fetch members', { status: response.status })
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch members'
                })
            }
            const data = await response.json()
            logger.info('Successfully fetched members', { count: data.items.length })
            return data
        }),

    getById: protectedProcedure.input(z.number()).query(async ({ input }): Promise<Member> => {
        logger.info('Fetching member by ID', { id: input })
        const response = await fetch(`${API_URL}/api/members/${input}`)
        if (!response.ok) {
            logger.error('Member not found', { id: input, status: response.status })
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Member not found'
            })
        }
        const data = await response.json()
        logger.info('Successfully fetched member', { id: input })
        return data
    }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                address: z.string().optional()
            })
        )
        .mutation(async ({ input }): Promise<Member> => {
            logger.info('Creating new member', { input })
            const response = await fetch(`${API_URL}/api/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            if (!response.ok) {
                const error = await response.json()
                logger.error('Failed to create member', { input, error })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to create member'
                })
            }
            const data = await response.json()
            logger.info('Successfully created member', { id: data.id })
            return data
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().optional(),
                email: z.string().email().optional(),
                address: z.string().optional()
            })
        )
        .mutation(async ({ input }): Promise<Member> => {
            logger.info('Updating member', { input })
            const { id, ...data } = input
            const response = await fetch(`${API_URL}/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                const error = await response.json()
                logger.error('Failed to update member', { input, error })
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to update member'
                })
            }
            const updatedMember = await response.json()
            logger.info('Successfully updated member', { id })
            return updatedMember
        }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input }): Promise<Member> => {
        logger.info('Deleting member', { id: input })
        const response = await fetch(`${API_URL}/api/members/${input}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            const error = await response.json()
            logger.error('Failed to delete member', { id: input, error })
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: error.detail || 'Failed to delete member'
            })
        }
        const deletedMember = await response.json()
        logger.info('Successfully deleted member', { id: input })
        return deletedMember
    }),

    payDebt: protectedProcedure
        .input(
            z.object({
                id: z.number(),
                amount: z.number().positive()
            })
        )
        .mutation(async ({ input }): Promise<Member> => {
            const response = await fetch(`${API_URL}/api/members/${input.id}/pay-debt?amount=${input.amount}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) {
                const error = await response.json()
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: error.detail || 'Failed to process payment'
                })
            }
            return response.json()
        }),

    clearDebt: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
        logger.info('Clearing debt for member', { id: input })
        const response = await fetch(`${API_URL}/api/members/${input}/clear-debt`, {
            method: 'POST'
        })
        if (!response.ok) {
            const error = await response.json()
            logger.error('Failed to clear debt', { id: input, error })
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: error.detail || 'Failed to clear debt'
            })
        }
        const result = await response.json()
        logger.info('Successfully cleared debt for member', { id: input })
        return result
    })
})
