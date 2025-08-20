import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import FilterBar from '../components/FilterBar'
import JobCard from '../components/JobCard'
import { useStore } from '../store/useStore'
import { jobsData } from '../daata/jobs'

export default function Home() {
  const { filters, addFilter, removeFilter, clearFilters, darkMode, toggleDarkMode } = useStore()
  const [filteredJobs, setFilteredJobs] = useState(jobsData)

  useEffect(() => {
    if (filters.length === 0) {
      setFilteredJobs(jobsData)
    } else {
      const filtered = jobsData.filter(job => {
        const jobFilters = [job.role, job.level, ...job.languages, ...job.tools]
        return filters.every(filter => jobFilters.includes(filter))
      })
      setFilteredJobs(filtered)
    }
  }, [filters])

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-900' : 'bg-primary-50'}`}>
      <Head>
        <title>Job Listings with Filtering</title>
        <meta name="description" content="Filter job listings based on various criteria" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header darkMode={darkMode} onToggleTheme={toggleDarkMode} />
      
      <main className="container mx-auto px-4 pb-12">
        <FilterBar 
          filters={filters} 
          onRemoveFilter={removeFilter} 
          onClearFilters={clearFilters} 
        />
        <div className="grid gap-10 md:gap-6 mt-14">
          {filteredJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onAddFilter={addFilter} 
            />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-4">No jobs found</h2>
            <p className="text-dark-500 dark:text-dark-400">Try adjusting your filters to find more jobs.</p>
          </div>
        )}
      </main>
    </div>
  )
}