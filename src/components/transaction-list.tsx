// components/transaction-list.tsx
"use client"

import { useState } from 'react'
// import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/types/transaction'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { TransactionForm } from './transaction-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type TransactionListProps = {
  initialTransactions: Transaction[]
  onTransactionChange: () => void
}

export function TransactionList({ initialTransactions, onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
//   const { toast } = useToast()

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      setTransactions(transactions.filter(t => t.id !== id))
      onTransactionChange()
      
    //   toast({
    //     title: 'Transaction deleted',
    //     variant: 'default',
    //   })
    } catch (error) {
    //   toast({
    //     title: 'Error',
    //     description: error instanceof Error ? error.message : 'Something went wrong',
    //     variant: 'destructive',
    //   })
    }
  }

  const handleEditSuccess = (newTransaction: Transaction) => {
    // Update the transactions list with the edited transaction
    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => t.id === newTransaction.id ? newTransaction : t)
      )
    } else {
      // If it's a new transaction (not editing), add it to the list
      setTransactions(prev => [...prev, newTransaction])
    }
    setEditingTransaction(null)
    onTransactionChange()
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className="text-right">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog 
        open={!!editingTransaction} 
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm 
              transaction={editingTransaction}
              onSuccess={(newTransaction) => handleEditSuccess(newTransaction)}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}