// components/transaction-list.tsx
"use client"

import { useEffect, useState } from 'react'
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from '@/lib/api'

type TransactionListProps = {
  initialTransactions: Transaction[]
  onTransactionChange?: () => void
}

export function TransactionList({ initialTransactions, onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Only update local state when initialTransactions change from the parent
  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  // Helper to check if a string is a valid MongoDB ObjectId
  const isValidObjectId = (id: string): boolean => {
    return Boolean(id) && /^[0-9a-fA-F]{24}$/.test(id)
  }

  const handleDelete = async (id: string) => {
    if (!isValidObjectId(id)) {
      console.error("Invalid MongoDB ObjectId format:", id)
      return
    }

    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await api.deleteTransaction(id)
      setTransactions(transactions.filter(t => t.id !== id))
      // Notify parent component of the change
      if (onTransactionChange) onTransactionChange()
    } catch (error) {
      console.error(error)
      // Add toast notification
      import('sonner').then(({ toast }) => {
        toast.error("Failed to delete transaction")
      })
    }
  }

  const handleEditSuccess = (newTransaction: Transaction) => {
    // Update the transactions list with the edited transaction
    if (editingTransaction && editingTransaction.id) {
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? newTransaction : t)
      )
    } else {
      // If it's a new transaction (not editing), add it to the list
      setTransactions(prev => [...prev, newTransaction])
    }
    setEditingTransaction(null)
    // Notify parent component of the change
    if (onTransactionChange) onTransactionChange()
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
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}