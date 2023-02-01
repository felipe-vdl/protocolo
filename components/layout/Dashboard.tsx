import Navbar from "../UI/Navbar";
import Footer from "../UI/Footer";
import Sidebar from "../UI/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen flex-col">
      <div id="notifications" />
      <Navbar />
      <div className="flex flex-1 bg-light-900 text-light-50 dark:bg-dark-900 dark:text-dark-50">
        <Sidebar />
        <div className="flex flex-1 p-4">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
