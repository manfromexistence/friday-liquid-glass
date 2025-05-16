'use client'

import { useCategorySidebar } from '@/components/category-sidebar'
import { useSubCategorySidebar } from '@/components/subcategory-sidebar'
import { cn } from '@/lib/utils'

interface MainProps {
  children: React.ReactNode
}

export function Main({ children }: MainProps) {
  const { stateCategorySidebar } = useCategorySidebar()
  const { stateSubCategorySidebar } = useSubCategorySidebar()

  return (
    <div
      className={cn(
        'no-scrollbar flex h-screen w-full flex-col overflow-y-auto transition-all duration-200 ease-linear md:pb-0',
        stateCategorySidebar === 'expanded' && 'pr-64',
        stateSubCategorySidebar === 'expanded' && 'pr-64'
      )}
    >
      {children}
    </div>
  )
}
