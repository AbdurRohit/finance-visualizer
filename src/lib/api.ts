// lib/api.ts
import { Transaction } from '@/types/transaction'

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  console.warn('API_URL is not defined in environment variables')
}

export const api = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/transactions`)
    if (!response.ok) {
      throw new Error('Failed to fetch transactions')
    }
    return response.json()
  },

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
    // Create a random temporary ID for the client side
    // The server should replace this with a real MongoDB ObjectId
    const tempId = Array(24).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    
    const transactionWithId = {
      ...data,
      id: tempId
    }
    
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionWithId)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || 'Failed to create transaction')
    }
    
    return response.json()
  },

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || 'Failed to update transaction')
    }
    
    return response.json()
  },

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || 'Failed to delete transaction')
    }
  }
}