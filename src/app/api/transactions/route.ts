// app/api/transactions/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description
      }
    })
    
    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}