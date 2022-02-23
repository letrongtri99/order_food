import { Request, Response } from 'express'
import { Redis } from 'ioredis'

export type MyContext = {
  req: Request & { session: any }
  redis: Redis
  res: Response
  payload?: { id: number; role: string }
}

export type Filter = {
  category?: string[]
  district?: string[]
  order_status?: number[]
  from_date?: string
  to_date?: string
}

export type Paginator = {
  page: number
  total: number
  pageSize: number
}
export type Sorting = {
  column: string
  direction: string
}
