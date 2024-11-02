'use client'

import * as React from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Book, Users, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingCells } from '@/components/ui/loading-cell'
import { api } from '@/trpc/react'
import { Transaction } from '@/types/prisma'
import type { MonthlyData } from '@/types/prisma'

export default function OverviewPage() {
    const overviewQuery = api.book.getOverview.useQuery()
    const recentTransactionsQuery = api.transaction.getRecent.useQuery({ limit: 5 })
    const monthlyDataQuery = api.transaction.getMonthlyData.useQuery()

    React.useEffect(() => {
        console.log(monthlyDataQuery.data)
    }, [monthlyDataQuery.data])
    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-8 text-3xl font-bold">Library Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {overviewQuery.isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">...</div>
                                <p className="text-xs text-muted-foreground">Loading data</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                                <Book className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overviewQuery.data?.totalBooks}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{overviewQuery.data?.newBooks} from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overviewQuery.data?.totalMembers}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{overviewQuery.data?.newMembers} from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overviewQuery.data?.activeLoans}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{overviewQuery.data?.loanIncrease}% from last week
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                                <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{overviewQuery.data?.overdueBooksPercentage}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {(overviewQuery.data?.overdueBooksPercentage ?? 0 > 0) ? '+' : '-'}
                                    {Math.abs(overviewQuery.data?.overdueBooksPercentage ?? 0)}% from last month
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Loans and Returns</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            {monthlyDataQuery.isLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : monthlyDataQuery.data ? (
                                <BarChart data={monthlyDataQuery.data}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Bar name="Loans" dataKey="loans" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                    <Bar name="Returns" dataKey="returns" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-muted-foreground">No data available</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest book loans and returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Book</TableHead>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactionsQuery.isLoading ? (
                                    <TableRow>
                                        <LoadingCells columns={4} />
                                    </TableRow>
                                ) : recentTransactionsQuery.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No recent transactions.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentTransactionsQuery.data.map((transaction: Transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.book.title}</TableCell>
                                            <TableCell>{transaction.member.name}</TableCell>
                                            <TableCell>{transaction.returnDate ? 'Return' : 'Loan'}</TableCell>
                                            <TableCell>
                                                {new Date(transaction.issueDate).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
