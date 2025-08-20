import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const JobCard = ({ job, onAddFilter }) => {
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  const handleTitleClick = () => {
    router.push(`/jobs/${job.id}`)
  }
  
  return (
    <div className={`bg-white dark:bg-dark-800 rounded-md shadow-lg p-5 md:p-6 relative border-l-4 ${job.featured ? 'border-primary-500' : 'border-transparent'} transition-all duration-300 hover:shadow-xl mt-10 md:mt-0`}>
      {/* Mobile Layout - Original Frontend Mentor design */}
      {isMobile ? (
        <>
          {/* Company Logo */}
          <div className="absolute -top-6 left-5 md:left-6 w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-primary-100">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{job.company.substring(0, 2)}</span>
            )}
          </div>
          
          <div className="mt-4">
            {/* Company Info */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary-500 font-bold text-sm">{job.company}</span>
              {job.new && <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">New!</span>}
              {job.featured && <span className="bg-dark-800 dark:bg-dark-900 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">Featured</span>}
            </div>
            
            {/* Position - Now clickable */}
            <h2 
              onClick={handleTitleClick}
              className="text-base font-bold text-dark-800 dark:text-white mb-2 hover:text-primary-500 cursor-pointer transition-colors"
            >
              {job.position}
            </h2>
            
            {/* Job Details */}
            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400 mb-4 text-xs">
              <span>{job.postedAt}</span>
              <span className="w-1 h-1 bg-dark-400 rounded-full"></span>
              <span>{job.contract}</span>
              <span className="w-1 h-1 bg-dark-400 rounded-full"></span>
              <span>{job.location}</span>
            </div>
            
            {/* Separator */}
            <hr className="mb-4 border-dark-300 dark:border-dark-600" />
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => onAddFilter(job.role)}
                className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors"
              >
                {job.role}
              </button>
              <button 
                onClick={() => onAddFilter(job.level)}
                className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors"
              >
                {job.level}
              </button>
              {job.languages.map((language, index) => (
                <button 
                  key={index}
                  onClick={() => onAddFilter(language)}
                  className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                >
                  {language}
                </button>
              ))}
              {job.tools.map((tool, index) => (
                <button 
                  key={index}
                  onClick={() => onAddFilter(tool)}
                  className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-primary-100 mr-6 flex-shrink-0">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-sm font-bold text-gray-500">{job.company.substring(0, 2)}</span>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-4 mb-1">
              <span className="text-primary-500 font-bold">{job.company}</span>
              {job.new && <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">New!</span>}
              {job.featured && <span className="bg-dark-800 dark:bg-dark-900 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">Featured</span>}
            </div>
            
            {/* Position - Now clickable */}
            <h2 
              onClick={handleTitleClick}
              className="text-lg font-bold text-dark-800 dark:text-white mb-2 hover:text-primary-500 cursor-pointer transition-colors"
            >
              {job.position}
            </h2>
            
            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400 text-sm">
              <span>{job.postedAt}</span>
              <span className="w-1 h-1 bg-dark-400 rounded-full"></span>
              <span>{job.contract}</span>
              <span className="w-1 h-1 bg-dark-400 rounded-full"></span>
              <span>{job.location}</span>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => onAddFilter(job.role)}
              className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition-colors"
            >
              {job.role}
            </button>
            <button 
              onClick={() => onAddFilter(job.level)}
              className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition-colors"
            >
              {job.level}
            </button>
            {job.languages.map((language, index) => (
              <button 
                key={index}
                onClick={() => onAddFilter(language)}
                className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition-colors"
              >
                {language}
              </button>
            ))}
            {job.tools.map((tool, index) => (
              <button 
                key={index}
                onClick={() => onAddFilter(tool)}
                className="text-primary-500 dark:text-primary-400 bg-primary-50 dark:bg-dark-700 hover:bg-primary-500 hover:text-white px-3 py-1 rounded-md text-sm font-bold transition-colors"
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobCard