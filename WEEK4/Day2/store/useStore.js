import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      filters: [],
      darkMode: false,
      
      addFilter: (filter) => {
        const { filters } = get()
        if (!filters.includes(filter)) {
          set({ filters: [...filters, filter] })
        }
      },
      
      removeFilter: (filter) => {
        const { filters } = get()
        set({ filters: filters.filter(f => f !== filter) })
      },
      
      clearFilters: () => {
        set({ filters: [] })
      },
      
      toggleDarkMode: () => {
        const { darkMode } = get()
        set({ darkMode: !darkMode })
        document.documentElement.classList.toggle('dark')
      },
    }),
    {
      name: 'job-filters-storage',
    }
  )
)