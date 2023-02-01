import Navbar from "../UI/Navbar";
import Footer from "../UI/Footer";
import Sidebar from "../UI/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <div id="notifications" />
      <Navbar />
      <div className="bg-light-900 text-light-50 dark:bg-dark-900 dark:text-dark-50 flex-1 flex">
        <Sidebar />
        <div className="flex-1 flex p-4">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}