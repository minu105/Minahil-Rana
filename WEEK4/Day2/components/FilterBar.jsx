import { X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const FilterBar = ({ filters, onRemoveFilter, onClearFilters }) => {
  const [isVisible, setIsVisible] = useState(false)
  const filterBarRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)
    
    return () => clearTimeout(timer)
  }, [])

  if (filters.length === 0) return null

  const handleRemoveFilter = (filter) => {
    onRemoveFilter(filter)
  }

  const handleClearFilters = () => {
    onClearFilters()
  }

  return (
    <div 
      ref={filterBarRef}
      className={`bg-white dark:bg-dark-800 rounded-md shadow-lg p-5 -mt-8 md:-mt-10 relative mx-4 md:mx-10 lg:mx-20 xl:mx-32 mb-8 z-40 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {filters.map((filter, index) => (
            <div 
              key={index} 
              className="flex items-center overflow-hidden rounded-md bg-primary-50 dark:bg-primary-900 group"
            >
              <span className="text-primary-500 dark:text-primary-300 px-3 py-1 text-sm font-bold">
                {filter}
              </span>
              <button 
                onClick={() => handleRemoveFilter(filter)}
                onMouseDown={(e) => e.preventDefault()} 
                className="bg-primary-500 hover:bg-primary-600 text-white p-2 transition-colors flex items-center justify-center h-full focus:outline-none focus:ring-2 focus:ring-primary-300"
                aria-label={`Remove ${filter} filter`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleClearFilters}
          onMouseDown={(e) => e.preventDefault()} 
          className="text-dark-500 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 font-bold transition-colors text-sm md:text-base px-3 py-1 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}

export default FilterBar