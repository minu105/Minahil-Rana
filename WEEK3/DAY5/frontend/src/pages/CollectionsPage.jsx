"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import axios from "axios"
const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "").replace(/s$/, "");

const CollectionsPage = () => {
  const { category } = useParams()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    collections: [],
    origins: [],
    flavours: [],
    qualities: [],
    cafeines: [],
    allergens: [],
    organic: false,
  })
  const [expandedFilters, setExpandedFilters] = useState({
    collections: false,
    origins: false,
    flavours: false,
    qualities: false,
    cafeines: false,
    allergens: false,
  })
  const [sortBy, setSortBy] = useState("name")

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  const filterOptions = {
    collections: [
      "Black teas",
      "Green teas",
      "White teas",
      "Chai",
      "Matcha",
      "Herbal teas",
      "Oolong",
      "Rooibos",
      "Teaware",
    ],
    origins: ["India", "Japan", "Iran", "South Africa"],
    flavours: ["Spicy", "Sweet", "Citrus", "Smooth", "Fruity", "Floral", "Grassy", "Minty", "Bitter", "Creamy"],
    qualities: ["Detox", "Energy", "Relax", "Digestion"],
    cafeines: ["No Caffeine", "Low Caffeine", "Medium Caffeine", "High Caffeine"],
    allergens: ["Lactose-free", "Gluten-free", "Nuts-free", "Soy-free"],
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const newFilters = { ...filters }
    const newExpandedFilters = { ...expandedFilters }

    Object.keys(filterOptions).forEach((filterType) => {
      const paramValue = searchParams.get(filterType)
      if (paramValue) {
        newFilters[filterType] = [paramValue]
        newExpandedFilters[filterType] = true
      }
    })

    if (searchParams.get("organic") === "true") {
      newFilters.organic = true
    }

    setFilters(newFilters)
    setExpandedFilters(newExpandedFilters)
  }, [location.search])

  useEffect(() => {
    applyFilters()
  }, [products, filters, category, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`)
      let data = response.data?.data?.products || []

      // Normalize products to match filters
      data = data.map((p) => {
        // Map category into collection-style filter
        let mappedCollection = ""
        switch (p.category) {
          case "black-tea":
            mappedCollection = "Black teas"
            break
          case "green-tea":
            mappedCollection = "Green teas"
            break
          case "white-tea":
            mappedCollection = "White teas"
            break
          case "herbal-tea":
            mappedCollection = "Herbal teas"
            break
          case "oolong-tea":
            mappedCollection = "Oolong"
            break
          case "chai":
            mappedCollection = "Chai"
            break
          default:
            mappedCollection = p.collection || ""
        }

        // Map caffeine
        let mappedCaffeine = ""
        switch (p.caffeineLevel) {
          case "none":
            mappedCaffeine = "No Caffeine"
            break
          case "low":
            mappedCaffeine = "Low Caffeine"
            break
          case "medium":
            mappedCaffeine = "Medium Caffeine"
            break
          case "high":
            mappedCaffeine = "High Caffeine"
            break
          default:
            mappedCaffeine = ""
        }

        return {
          ...p,
          collection: mappedCollection,
          caffeine: mappedCaffeine,
          flavour: p.tags || [], // treat tags as flavours
          qualities: p.tags || [], // reuse tags for qualities too
          allergens: [], // none in seed, leave empty
          organic: p.collection === "organic", // if collection is "organic", set organic true
        }
      })

      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const safeProducts = Array.isArray(products) ? [...products] : []
    let filtered = safeProducts

    if (category) {
      const categoryName = normalize(category.replace("-", " "))
      filtered = filtered.filter(
        (product) => normalize(product.collection) === categoryName
      )
    }

    if (filters.collections.length > 0) {
      filtered = filtered.filter((product) =>
        filters.collections.some((f) => normalize(product.collection) === normalize(f))
      )
    }

    if (filters.origins.length > 0) {
      filtered = filtered.filter((product) =>
        filters.origins.some((o) => normalize(product.origin) === normalize(o))
      )
    }

    if (filters.flavours.length > 0) {
      filtered = filtered.filter(
        (product) =>
          Array.isArray(product.flavour) &&
          product.flavour.some((f) =>
            filters.flavours.some((fltr) => normalize(f) === normalize(fltr))
          )
      )
    }

    if (filters.qualities.length > 0) {
      filtered = filtered.filter(
        (product) =>
          Array.isArray(product.qualities) &&
          product.qualities.some((q) =>
            filters.qualities.some((fltr) => normalize(q) === normalize(fltr))
          )
      )
    }

    if (filters.cafeines.length > 0) {
      filtered = filtered.filter((product) =>
        filters.cafeines.some((c) => normalize(product.caffeine) === normalize(c))
      )
    }

    if (filters.allergens.length > 0) {
      filtered = filtered.filter(
        (product) =>
          Array.isArray(product.allergens) &&
          product.allergens.some((a) =>
            filters.allergens.some((fltr) => normalize(a) === normalize(fltr))
          )
      )
    }

    if (filters.organic) {
      filtered = filtered.filter((product) => product.organic)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }

  const toggleFilter = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }))
  }

  const toggleExpandedFilter = (filterType) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Image */}
      <div
        className="h-48 sm:h-64 lg:h-[308px] xl:h-[358px] bg-cover bg-center"
        style={{ backgroundImage: `url('/images/BgPic.png')` }}
      ></div>

      {/* Breadcrumb */}
      <div className="py-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm flex flex-wrap items-center">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
              HOME
            </Link>
            <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
            <Link
              to="/collections"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              COLLECTIONS
            </Link>

            {category && (
              <>
                <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
                <span className="text-gray-800 dark:text-gray-200 uppercase">{category.replace("-", " ")}</span>
              </>
            )}

            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map((val) => (
                  <span key={`${key}-${val}`} className="flex items-center">
                    <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
                    <span className="text-gray-800 dark:text-gray-200 capitalize">{val}</span>
                  </span>
                ))
              }
              if (typeof value === "boolean" && value) {
                return (
                  <span key={key} className="flex items-center">
                    <span className="mx-2 text-gray-600 dark:text-gray-400">/</span>
                    <span className="text-gray-800 dark:text-gray-200 capitalize">{key}</span>
                  </span>
                )
              }
              return null
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="space-y-6">
              {/* Collections Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("collections")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  COLLECTIONS
                  <span className="text-lg">{expandedFilters.collections ? "-" : "+"}</span>
                </button>
                {expandedFilters.collections && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.collections.map((collection) => (
                      <label key={collection} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.collections.includes(collection)}
                          onChange={() => toggleFilter("collections", collection)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{collection}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Origin Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("origins")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  ORIGIN
                  <span className="text-lg">{expandedFilters.origins ? "-" : "+"}</span>
                </button>
                {expandedFilters.origins && (
                  <div className="mt-4 space-y-2">
                    {filterOptions.origins.map((origin) => (
                      <label key={origin} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.origins.includes(origin)}
                          onChange={() => toggleFilter("origins", origin)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{origin}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Flavour Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("flavours")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  FLAVOUR
                  <span className="text-lg">{expandedFilters.flavours ? "-" : "+"}</span>
                </button>
                {expandedFilters.flavours && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.flavours.map((flavour) => (
                      <label key={flavour} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.flavours.includes(flavour)}
                          onChange={() => toggleFilter("flavours", flavour)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{flavour}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Qualities Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("qualities")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  QUALITIES
                  <span className="text-lg">{expandedFilters.qualities ? "-" : "+"}</span>
                </button>
                {expandedFilters.qualities && (
                  <div className="mt-4 space-y-2">
                    {filterOptions.qualities.map((quality) => (
                      <label key={quality} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.qualities.includes(quality)}
                          onChange={() => toggleFilter("qualities", quality)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{quality}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Caffeine Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("cafeines")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  CAFFEINE
                  <span className="text-lg">{expandedFilters.cafeines ? "-" : "+"}</span>
                </button>
                {expandedFilters.cafeines && (
                  <div className="mt-4 space-y-2">
                    {filterOptions.cafeines.map((caffeine) => (
                      <label key={caffeine} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.cafeines.includes(caffeine)}
                          onChange={() => toggleFilter("cafeines", caffeine)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{caffeine}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Allergens Filter */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                  onClick={() => toggleExpandedFilter("allergens")}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white pb-2"
                >
                  ALLERGENS
                  <span className="text-lg">{expandedFilters.allergens ? "-" : "+"}</span>
                </button>
                {expandedFilters.allergens && (
                  <div className="mt-4 space-y-2">
                    {filterOptions.allergens.map((allergen) => (
                      <label key={allergen} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.allergens.includes(allergen)}
                          onChange={() => toggleFilter("allergens", allergen)}
                          className="mr-2 rounded border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:ring-gray-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{allergen}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Organic Toggle */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <span className="font-medium text-gray-900 dark:text-white mr-3">ORGANIC</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.organic}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          organic: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-3.5 pt-[1px] border border-gray-800 dark:border-gray-300 rounded-full bg-white dark:bg-gray-700 transition-colors`}
                    >
                      <div
                        className={`w-2.5 h-2.5 bg-gray-800 dark:bg-gray-300 rounded-full transition-transform ${
                          filters.organic ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <p className="text-gray-600 dark:text-gray-400">Showing {filteredProducts.length} products</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                      <img
                        src={`http://localhost:3000${product.image || "../../public/images/Blacktea.png"}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        €{product.price?.toFixed(2)} / {product.weight || "50 g"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionsPage