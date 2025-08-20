import { useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import '../styles/global.css'
// lalal
function MyApp({ Component, pageProps }) {
  const { darkMode } = useStore()
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return <Component {...pageProps} />
}

export default MyApp