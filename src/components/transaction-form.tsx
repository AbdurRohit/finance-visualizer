// components/transaction-form.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '../types/transaction'
import { api } from '@/lib/api'

type TransactionFormProps = {
  transaction?: Transaction
  onSuccess: (newTransaction: Transaction) => void
  onCancel?: () => void
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!transaction

  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    date: transaction?.date 
      ? new Date(transaction.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    description: transaction?.description || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent multiple submissions
    setIsLoading(true)

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description
      }

      let newTransaction: Transaction
      if (isEditing && transaction?.id) {
        // Check if ID is a valid MongoDB ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(transaction.id)) {
          throw new Error(`Invalid MongoDB ObjectId format: ${transaction.id}`)
        }
        
        newTransaction = await api.updateTransaction(transaction.id, transactionData)
      } else {
        newTransaction = await api.createTransaction(transactionData)
      }

      onSuccess(newTransaction)
      import('sonner').then(({ toast }) => {
        toast.success(isEditing ? 'Transaction updated' : 'Transaction added')
      })
    } catch (error) {
      console.error(error)
      import('sonner').then(({ toast }) => {
        toast.error("Failed to save transaction")
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="e.g., Groceries"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} >
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}