'use client'

import * as React from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Book, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Mock data
const overviewData = {
    totalBooks: 1250,
    totalMembers: 500,
    activeLoans: 75,
    overdueBooksPercentage: 8
}

const recentTransactions = [
    { id: 1, book: 'To Kill a Mockingbird', member: 'John Doe', type: 'Loan', date: '2023-07-01' },
    { id: 2, book: '1984', member: 'Jane Smith', type: 'Return', date: '2023-06-30' },
    { id: 3, book: 'Pride and Prejudice', member: 'Alice Johnson', type: 'Loan', date: '2023-06-29' },
    { id: 4, book: 'The Great Gatsby', member: 'Bob Wilson', type: 'Loan', date: '2023-06-28' },
    { id: 5, book: 'Brave New World', member: 'Emma Brown', type: 'Return', date: '2023-06-27' }
]

const monthlyData = [
    { name: 'Jan', loans: 65, returns: 60 },
    { name: 'Feb', loans: 59, returns: 55 },
    { name: 'Mar', loans: 80, returns: 78 },
    { name: 'Apr', loans: 81, returns: 75 },
    { name: 'May', loans: 56, returns: 58 },
    { name: 'Jun', loans: 55, returns: 52 },
    { name: 'Jul', loans: 40, returns: 45 }
]

export default function OverviewPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-8 text-3xl font-bold">Library Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewData.totalBooks}</div>
                        <p className="text-xs text-muted-foreground">+20 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewData.totalMembers}</div>
                        <p className="text-xs text-muted-foreground">+15 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewData.activeLoans}</div>
                        <p className="text-xs text-muted-foreground">+7% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overviewData.overdueBooksPercentage}%</div>
                        <p className="text-xs text-muted-foreground">-2% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Monthly Loans and Returns</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData}>
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
                                <Bar dataKey="loans" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="returns" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
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
                                {recentTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.book}</TableCell>
                                        <TableCell>{transaction.member}</TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>{transaction.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
