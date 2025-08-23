import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Collections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              COLLECTIONS
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/collections/black-tea"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Black teas
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/green-tea"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Green teas
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/white-tea"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  White teas
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/herbal-tea"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Herbal teas
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/matcha"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Matcha
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/chai"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Chai
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/oolong"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Oolong
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/rooibos"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Rooibos
                </Link>
              </li>
              <li>
                <Link
                  to="/collections/teaware"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Teaware
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              LEARN
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/about-teas"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  About our teas
                </Link>
              </li>
              <li>
                <Link
                  to="/tea-academy"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Tea academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/ordering"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Ordering and payment
                </Link>
              </li>
              <li>
                <Link
                  to="/delivery"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Delivery
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Privacy and policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              CONTACT US
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <p className="flex items-start">
                <img src="/images/Location.png" alt="location" className="mt-1 mr-2 dark:invert" />
                <span>
                  3 Falahi, Falahi St, Pasdaran Ave,
                  <br />
                  Shiraz, Fars Providence
                  <br />
                  Iran
                </span>
              </p>
              <p className="flex items-center">
                <img src="/images/Email.png" alt="email" className="mr-2 dark:invert" />
                <span>Email: amoopur@gmail.com</span>
              </p>
              <p className="flex items-center">
                <img src="/images/Phone.png" alt="phone" className="mr-2 dark:invert" />
                <span>Tel: +98 9173038406</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
