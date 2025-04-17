"use client"
// app/page.tsx
import { Suspense } from 'react'
import { Transaction } from '@/types/transaction'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { MonthlyChart } from '@/components/monthly-chart'
import { api } from '@/lib/api'
// import { Toaster } from '@/components/ui/sonner'

async function getTransactions(): Promise<Transaction[]> {
  try {
    return await api.getTransactions()
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return []
  }
}

export default async function Home() {
  const transactions = await getTransactions()

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Personal Finance Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Suspense fallback={<div>Loading form...</div>}>
            <ClientForm />
          </Suspense>
        </div>
        
        <div className="md:col-span-2">
          <Suspense fallback={<div>Loading chart...</div>}>
            <MonthlyChart transactions={transactions} />
          </Suspense>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <Suspense fallback={<div>Loading transactions...</div>}>
          <ClientTransactionList initialTransactions={transactions} />
        </Suspense>
      </div>
      
      {/* <Toaster /> */}
    </div>
  )
}

// client hooks 

import { useRouter } from 'next/navigation'

function ClientForm() {
  const router = useRouter()
  
  const handleSuccess = (newTransaction: Transaction) => {
    router.refresh()
  }
  
  return <TransactionForm onSuccess={handleSuccess} />
}

function ClientTransactionList({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const router = useRouter()
  
  const handleTransactionChange = () => {
    router.refresh()
  }
  
  return (
    <TransactionList 
      initialTransactions={initialTransactions} 
      onTransactionChange={handleTransactionChange} 
    />
  )
}