import Navbar from "../UI/Navbar";
import Footer from "../UI/Footer";

export default function RegularLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-mesquita">
      <Navbar />
      <main className="flex-1 flex bg-light-900 text-light-50 dark:bg-dark-900 dark:text-dark-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}