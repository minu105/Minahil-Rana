"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from '../app/rtkRequest';
const LandingPage = () => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://minahil-rana.vercel.app/api"

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/products`)
      const products = Array.isArray(response.data) ? response.data : response.data.products || []
      const productsByCollection = products.reduce((acc, product) => {
        const collection = product.collection || "Other"
        if (!acc[collection]) {
          acc[collection] = []
        }
        acc[collection].push(product)
        return acc
      }, {})

      setCollections(
        Object.keys(productsByCollection).map((key) => ({
          name: key,
          products: productsByCollection[key],
        })),
      )
    } catch (error) {
      console.error("Error fetching collections:", error)
      setCollections([]) 
    } finally {
      setLoading(false)
    }
  }

  const collectionImages = {
    "BLACK TEA": "/images/Blacktea.png",
    "GREEN TEA": "/images/Greentea.png",
    "WHITE TEA": "/images/Whitetea.png",
    MATCHA: "/images/Matcha.png",
    "HERBAL TEA": "/images/Herbaltea.png",
    CHAI: "/images/Chai.png",
    OOLONG: "/images/Oolong.png",
    ROOIBOS: "/images/Rooibos.png",
    TEAWARE: "/images/Teaware.png",
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="w-full bg-white dark:bg-gray-900 pb-12 lg:pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 lg:gap-20 lg:grid-cols-2">
          {/* Left Image */}
          <div className="h-64 sm:h-80 lg:h-auto order-2 lg:order-1">
            <img src="/images/LandingImage.png" alt="Tea varieties" className="w-full h-full object-cover" />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-center px-6 py-6 lg:px-16 lg:py-10 order-1 lg:order-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 lg:mb-6 text-gray-900 dark:text-gray-100 font-prosto">
              Every day is unique, <br /> just like our tea
            </h1>
            <p className="text-sm sm:text-base mb-3 lg:mb-4 text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
            </p>
            <p className="text-sm sm:text-base mb-6 lg:mb-8 text-gray-700 dark:text-gray-300">
              Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
            </p>
            <Link
              to="/collections"
              className="w-full sm:w-auto max-w-xs inline-block bg-gray-800 dark:bg-gray-700 text-white px-8 sm:px-16 py-3 font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors text-center"
            >
              BROWSE TEAS
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-6 pt-12 bg-gray-100 bg-opacity-5 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
            <div className="flex flex-col sm:flex-row items-center">
              <img src="/images/Cup.png" alt="cup" className="mb-2 sm:mb-0 sm:mr-4 dark:invert" />
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100">
                450+ KIND OF LOOSE TEA
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center">
              <img src="/images/Gift.png" alt="gift" className="mb-2 sm:mb-0 sm:mr-4 dark:invert" />
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100">
                CERTIFICATED ORGANIC TEAS
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center">
              <img src="/images/Truck.png" alt="truck" className="mb-2 sm:mb-0 sm:mr-4 dark:invert" />
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100">FREE DELIVERY</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center">
              <img src="/images/Tag.png" alt="tag" className="mb-2 sm:mb-0 sm:mr-4 dark:invert" />
              <h3 className="font-semibold text-sm lg:text-base text-gray-900 dark:text-gray-100">
                SAMPLE FOR ALL TEAS
              </h3>
            </div>
          </div>
          <div className="text-center mt-12 lg:mt-16">
            <button className="border border-gray-800 dark:border-gray-300 text-gray-800 dark:text-gray-300 px-8 sm:px-16 py-3 font-medium hover:bg-gray-800 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900 transition-colors cursor-pointer">
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-12 lg:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-gray-900 dark:text-gray-100 font-prosto">
            Our Collections
          </h2>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">Loading collections...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
              {/* First Row */}
              <Link to="/collections?collections=Black teas" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["BLACK TEA"] || "/placeholder.svg"}
                    alt="Black Tea"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">BLACK TEA</h3>
              </Link>

              <Link to="/collections?collections=Green teas" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["GREEN TEA"] || "/placeholder.svg"}
                    alt="Green Tea"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">GREEN TEA</h3>
              </Link>

              <Link to="/collections?collections=White teas" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["WHITE TEA"] || "/placeholder.svg"}
                    alt="White Tea"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">WHITE TEA</h3>
              </Link>

              {/* Second Row */}
              <Link to="/collections?collections=Matcha" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["MATCHA"] || "/placeholder.svg"}
                    alt="Matcha"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">MATCHA</h3>
              </Link>

              <Link to="/collections?collections=Herbal teas" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["HERBAL TEA"] || "/placeholder.svg"}
                    alt="Herbal Tea"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">HERBAL TEA</h3>
              </Link>

              <Link to="/collections?collections=Chai" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["CHAI"] || "/placeholder.svg"}
                    alt="Chai"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">CHAI</h3>
              </Link>

              {/* Third Row */}
              <Link to="/collections?collections=Oolong" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["OOLONG"] || "/placeholder.svg"}
                    alt="Oolong"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">OOLONG</h3>
              </Link>

              <Link to="/collections?collections=Rooibos" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["ROOIBOS"] || "/placeholder.svg"}
                    alt="Rooibos"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">ROOIBOS</h3>
              </Link>

              <Link to="/collections?collections=Teaware" className="group flex flex-col items-center">
                <div className="overflow-hidden w-full max-w-sm aspect-square">
                  <img
                    src={collectionImages["TEAWARE"] || "/placeholder.svg"}
                    alt="Teaware"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-center text-gray-900 dark:text-gray-100">TEAWARE</h3>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default LandingPage
