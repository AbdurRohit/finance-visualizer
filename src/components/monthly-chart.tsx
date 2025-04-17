// components/monthly-chart.tsx
"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Transaction } from '@/types/transaction'

type MonthlyChartProps = {
  transactions: Transaction[]
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })
      
      if (!months[monthYear]) {
        months[monthYear] = 0
      }
      
      months[monthYear] += transaction.amount
    })
    
    return Object.entries(months)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => {
        // Sort by date
        const [aMonth, aYear] = a.name.split(' ')
        const [bMonth, bYear] = b.name.split(' ')
        return new Date(`${aMonth} 1, ${aYear}`).getTime() - 
               new Date(`${bMonth} 1, ${bYear}`).getTime()
      })
      .slice(-6) // Last 6 months
  }, [transactions])

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Bar dataKey="amount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}