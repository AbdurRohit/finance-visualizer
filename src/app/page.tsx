"use client"

// app/page.tsx
import { useState, useEffect } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { MonthlyChart } from '@/components/monthly-chart'
import { api } from '@/lib/api'
import { Toaster } from 'sonner'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch transactions only once on mount and when explicitly requested
  const fetchTransactions = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const data = await api.getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSuccess = (newTransaction: Transaction) => {
    // Optimistically update the local state
    setTransactions(prev => {
      const exists = prev.some(t => t.id === newTransaction.id)
      if (exists) {
        return prev.map(t => t.id === newTransaction.id ? newTransaction : t)
      } else {
        return [...prev, newTransaction]
      }
    })
    
    // No need to refetch everything - we already have the updated data
  }

  const handleTransactionChange = () => {
    // Only do a full refetch when needed (e.g., after delete operations)
    fetchTransactions()
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Personal Finance Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {isLoading ? (
            <div>Loading form...</div>
          ) : (
            <TransactionForm onSuccess={handleSuccess} />
          )}
        </div>
        
        <div className="md:col-span-2">
          {isLoading ? (
            <div>Loading chart...</div>
          ) : (
            <MonthlyChart transactions={transactions} />
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        {isLoading ? (
          <div>Loading transactions...</div>
        ) : (
          <TransactionList
            initialTransactions={transactions}
            onTransactionChange={handleTransactionChange}
          />
        )}
      </div>
      
      <Toaster />
    </div>
  )
}