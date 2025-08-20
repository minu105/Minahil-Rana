import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useStore } from '../../store/useStore'
import { jobsData } from '../../daata/jobs'
import { ArrowLeft, MapPin, Clock, Calendar, DollarSign, Users, BookOpen, ExternalLink, Share } from 'lucide-react'
import { useState, useEffect } from 'react'

const JobDetail = () => {
  const router = useRouter()
  const { id } = router.query
  const { darkMode, toggleDarkMode } = useStore()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  const job = jobsData.find(j => j.id === parseInt(id))
  
  if (!job) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark bg-dark-900' : 'bg-primary-50'}`}>
        <Head>
          <title>Job Not Found | JobFinder</title>
        </Head>
        <Header darkMode={darkMode} onToggleTheme={toggleDarkMode} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white mb-4">Job Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="text-primary-500 dark:text-primary-400 hover:underline flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go back to jobs
          </button>
        </div>
      </div>
    )
  }

  // Generate more detailed job description
  const jobDescription = {
    overview: `We are looking for a ${job.position} to join our ${job.company} team. This is a ${job.contract.toLowerCase()} position that is ${job.location === 'Remote' ? 'fully remote' : `based in ${job.location}`}.`,
    
    responsibilities: [
      "Design, develop, and maintain high-quality web applications",
      "Collaborate with cross-functional teams to define, design, and ship new features",
      "Write clean, maintainable, and efficient code",
      "Troubleshoot and debug to optimize performance",
      "Participate in code reviews to maintain code quality",
      "Stay up-to-date with emerging technologies and industry trends"
    ],
    
    requirements: [
      `Proven experience as a ${job.position} or similar role`,
      `Strong proficiency in ${job.languages.join(', ')}`,
      job.tools.length > 0 ? `Experience with ${job.tools.join(', ')}` : "Familiarity with modern development tools",
      "Understanding of responsive design principles",
      "Excellent problem-solving skills and attention to detail",
      "Strong communication and teamwork skills"
    ],
    
    benefits: [
      "Competitive salary and performance bonuses",
      "Comprehensive health insurance package",
      "Flexible working hours and remote work options",
      "Professional development opportunities",
      "Modern equipment and tools",
      "Collaborative and inclusive work environment"
    ]
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-dark-900' : 'bg-primary-50'}`}>
      <Head>
        <title>{job.position} at {job.company} | JobFinder</title>
        <meta name="description" content={`Apply for ${job.position} at ${job.company}. ${job.contract} position in ${job.location}.`} />
      </Head>

      <Header darkMode={darkMode} onToggleTheme={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-primary-500 dark:text-primary-400 hover:underline mb-8 group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </button>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-5 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-700 flex items-center justify-center border border-gray-200 dark:border-dark-600 mx-auto md:mx-0">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-sm font-bold text-gray-500">{job.company.substring(0, 2)}</span>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-dark-800 dark:text-white mb-2">{job.position}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-dark-500 dark:text-dark-400 mb-3 md:mb-4">
                  <span className="font-medium">{job.company}</span>
                  <div className="hidden md:block w-1 h-1 bg-dark-400 rounded-full"></div>
                  <span>{job.location}</span>
                  <div className="flex justify-center md:justify-start gap-2 mt-2 md:mt-0">
                    {job.new && <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">New</span>}
                    {job.featured && <span className="bg-dark-800 dark:bg-dark-900 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">Featured</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 md:mt-0 justify-center md:justify-end">
              <button className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-lg border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <Share size={16} />
                {!isMobile && "Share"}
              </button>
              <a 
                href="#apply" 
                className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-md inline-flex items-center gap-2 transition-colors text-sm md:text-base"
              >
                Apply Now
                {!isMobile && <ExternalLink size={16} />}
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-5 flex items-center">
            <MapPin className="text-primary-500 mr-3 md:mr-4 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-dark-500 dark:text-dark-400">Location</p>
              <p className="font-medium text-dark-800 dark:text-white text-sm md:text-base">{job.location}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-5 flex items-center">
            <Clock className="text-primary-500 mr-3 md:mr-4 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-dark-500 dark:text-dark-400">Contract</p>
              <p className="font-medium text-dark-800 dark:text-white text-sm md:text-base">{job.contract}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-5 flex items-center">
            <Calendar className="text-primary-500 mr-3 md:mr-4 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-dark-500 dark:text-dark-400">Posted</p>
              <p className="font-medium text-dark-800 dark:text-white text-sm md:text-base">{job.postedAt}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-5 flex items-center">
            <DollarSign className="text-primary-500 mr-3 md:mr-4 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-dark-500 dark:text-dark-400">Level</p>
              <p className="font-medium text-dark-800 dark:text-white text-sm md:text-base">{job.level}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-5 md:p-6 mb-6 md:mb-8">
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-dark-800 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
              <BookOpen size={18} />
              Job Overview
            </h2>
            <p className="text-dark-600 dark:text-dark-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
              {jobDescription.overview} The ideal candidate will have experience with modern web technologies and a passion for creating exceptional user experiences. If you're a problem-solver who thrives in a collaborative environment, we'd love to hear from you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-dark-800 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Responsibilities
                </h3>
                <ul className="space-y-1 md:space-y-2">
                  {jobDescription.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-dark-600 dark:text-dark-300 text-sm md:text-base">
                      <span className="text-primary-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-base md:text-lg font-semibold text-dark-800 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                  <BookOpen size={16} />
                  Requirements
                </h3>
                <ul className="space-y-1 md:space-y-2">
                  {jobDescription.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-dark-600 dark:text-dark-300 text-sm md:text-base">
                      <span className="text-primary-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-semibold text-dark-800 dark:text-white mb-2 md:mb-3">Technologies & Tools</h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <span className="bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium">{job.role}</span>
                <span className="bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium">{job.level}</span>
                {job.languages.map((language, index) => (
                  <span key={index} className="bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium">
                    {language}
                  </span>
                ))}
                {job.tools.map((tool, index) => (
                  <span key={index} className="bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg md:text-xl font-bold text-dark-800 dark:text-white mb-3 md:mb-4">Benefits & Perks</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {jobDescription.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-dark-600 dark:text-dark-300 text-sm md:text-base">
                  <span className="text-primary-500">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div id="apply" className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-dark-800 dark:text-white mb-4 md:mb-6">Apply for this position</h2>
          <form className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors text-sm md:text-base" 
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors text-sm md:text-base" 
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors text-sm md:text-base" 
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Current Location</label>
                <input 
                  type="text" 
                  id="location" 
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors text-sm md:text-base" 
                  placeholder="Your city and country"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Resume/CV *</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  id="resume" 
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors file:mr-2 md:file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 text-sm md:text-base" 
                  required
                />
              </div>
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1 md:mt-2">PDF, DOC, or DOCX (Max: 5MB)</p>
            </div>
            
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Cover Letter</label>
              <textarea 
                id="coverLetter" 
                rows="4" 
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-dark-300 dark:border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white transition-colors text-sm md:text-base" 
                placeholder="Why are you interested in this position? What makes you a good fit?"
              ></textarea>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2" 
                required
              />
              <label htmlFor="terms" className="text-xs md:text-sm text-dark-700 dark:text-dark-300">
                I agree to the privacy policy and terms of service
              </label>
            </div>
            
            <button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 md:py-3 px-4 md:px-8 rounded-md transition-colors w-full md:w-auto text-sm md:text-base"
            >
              Submit Application
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default JobDetail