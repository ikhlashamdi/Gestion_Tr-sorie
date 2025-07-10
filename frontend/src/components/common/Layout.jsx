import Navbar from "./NavBar";
import Sidebar from "./SideBar";
import { useAppStore } from '../../store/appStore';

const Layout = ({ children }) => {
    const dopen = useAppStore((state) => state.dopen);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className={`flex flex-1 ${dopen ? 'gap-8' : 'gap-2'}`}>
                <Sidebar />
                {children}
            </div>
        </div>
    );
};

export default Layout;
