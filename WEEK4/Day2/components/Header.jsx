import ThemeToggle from './ThemeToggle'

const Header = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="bg-primary-500 h-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400"></div>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-64 h-64 -translate-x-32 -translate-y-32 rotate-45 bg-white rounded-3xl"></div>
        <div className="absolute top-10 right-10 w-40 h-40 rotate-12 bg-white rounded-2xl"></div>
        <div className="absolute bottom-5 left-20 w-32 h-32 -rotate-30 bg-white rounded-2xl"></div>
        <div className="absolute bottom-10 right-20 w-24 h-24 rotate-45 bg-white rounded-xl"></div>
      </div>
      
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-white text-2xl md:text-3xl font-bold">JobFinder</h1>
          <p className="text-primary-100 text-sm md:text-base mt-1">Discover your dream career</p>
        </div>
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
      </div>
      
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-10">
        <div className="w-16 h-16 -mb-8 bg-white opacity-10 rounded-full"></div>
        <div className="w-12 h-12 -mb-6 bg-white opacity-10 rounded-full"></div>
        <div className="w-10 h-10 -mb-5 bg-white opacity-10 rounded-full"></div>
      </div>
    </header>
  )
}

export default Header