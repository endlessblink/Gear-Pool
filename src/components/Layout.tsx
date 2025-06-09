
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
