import Navbar from "./NavBar";
import Sidebar from "./SideBar";
import { useAppStore } from '../../store/appStore';

const Layout = ({ children }) => {
  const dopen = useAppStore((state) => state.dopen);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <div className={`flex flex-1 ${dopen ? 'gap-8' : 'gap-2'}`}>
        <Sidebar />

  
        <main className="flex-1 bg-gray-50 p-4 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
