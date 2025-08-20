import { X } from 'lucide-react'

const FilterBar = ({ filters, onRemoveFilter, onClearFilters }) => {
  if (filters.length === 0) return null

  return (
    <div className="bg-white dark:bg-dark-800 rounded-md shadow-lg p-5 -mt-8 md:-mt-10 relative mx-4 md:mx-10 lg:mx-20 xl:mx-32 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Active Filters */}
        <div className="flex flex-wrap gap-3 flex-1">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center overflow-hidden rounded-md">
              <span className="bg-primary-50 dark:bg-primary-900 text-primary-500 dark:text-primary-300 px-3 py-1 text-sm font-bold">
                {filter}
              </span>
              <button 
                onClick={() => onRemoveFilter(filter)}
                className="bg-primary-500 hover:bg-dark-800 dark:hover:bg-dark-700 text-white p-2 transition-colors flex items-center justify-center"
                aria-label={`Remove ${filter} filter`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Clear Button */}
        <button 
          onClick={onClearFilters}
          className="text-dark-500 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 font-bold transition-colors text-sm md:text-base"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default FilterBar