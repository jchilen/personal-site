import { House, Wrench, Dices, Newspaper, type LucideIcon } from 'lucide-react'

export type Category = {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

export const categories: Category[] = [
  { id: 'home', label: 'Home', icon: House, color: '#5fd3b0' },
  { id: 'tools', label: 'Tools', icon: Wrench, color: '#f2b84b' },
  { id: 'lancer', label: 'Lancer', icon: Dices, color: '#e8615a' },
  { id: 'articles', label: 'Articles', icon: Newspaper, color: '#7cc4f4' },
]