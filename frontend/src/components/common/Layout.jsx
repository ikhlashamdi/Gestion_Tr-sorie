import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAppStore } from '../../store/appStore';
import { Outlet } from "react-router-dom"; 

const Layout = () => {
  const dopen = useAppStore((state) => state.dopen);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <div className={`flex flex-1 ${dopen ? 'gap-8' : 'gap-2'}`}>
        <div className="print:hidden">
          <Sidebar />
        </div>

        <main className="flex-1 bg-gray-50 p-4 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;