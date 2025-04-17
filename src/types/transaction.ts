// types/transaction.ts
export type Transaction = {
  id: string  // MongoDB ObjectId as string (24-character hexadecimal)
  amount: number
  date: Date | string
  description: string
}