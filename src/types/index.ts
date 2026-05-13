import { z } from 'zod'

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: string
  name: string
  color: string
  lightColor: string
  icon?: string
  isActive: boolean
  sortOrder: number
}

export interface Member {
  id: string
  name: string
  color: string
  lightColor: string
  isActive: boolean
}

export interface Transaction {
  id: string
  date: string // ISO 8601 (YYYY-MM-DD)
  name: string
  amount: number // 一律存正數，方向由 type 決定
  type: TransactionType
  note?: string
  categoryId: string
  memberId: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  yearMonth: string // "YYYY-MM"
  amount: number
  categoryId: string
}

export interface MonthlySummary {
  totalIncome: number
  totalExpense: number
  balance: number
  budgetUsageRate: number
  totalBudget: number
}

export interface CategoryStat {
  category: Category
  amount: number
  percentage: number
  transactionCount: number
}

export interface MemberStat {
  member: Member
  amount: number
  percentage: number
  byCategory: { category: Category; amount: number }[]
}

export interface BudgetStat {
  budget: Budget
  category: Category
  spent: number
  usageRate: number
  status: 'safe' | 'warn' | 'danger'
}

export interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  categoryIds?: string[]
  memberIds?: string[]
  type?: TransactionType | 'ALL'
  keyword?: string
  sort?: 'date_desc' | 'date_asc' | 'amount_desc'
}

// ---- Zod Schemas ----

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .number({ invalid_type_error: '金額必須為數字' })
    .positive('金額必須大於 0')
    .max(99999999, '金額過大'),
  name: z.string().min(1, '請輸入項目名稱').max(50, '最多 50 字元'),
  categoryId: z.string().min(1, '請選擇分類'),
  memberId: z.string().min(1, '請選擇成員'),
  date: z.string().min(1, '請選擇日期'),
  note: z.string().max(100, '備註最多 100 字元').optional().or(z.literal('')),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

export const categorySchema = z.object({
  name: z.string().min(1, '請輸入名稱').max(10, '名稱最多 10 字元'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '色彩格式錯誤'),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const memberSchema = z.object({
  name: z.string().min(1, '請輸入名稱').max(6, '名稱最多 6 字元'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '色彩格式錯誤'),
})

export type MemberFormData = z.infer<typeof memberSchema>
