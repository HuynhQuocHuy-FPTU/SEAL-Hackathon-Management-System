import { Outlet } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import TopNavbarPage from "../navbar/TopNavbarPage";

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50 text-gray-800 antialiased flex">
            <Sidebar />
            
            <div className="flex-1 min-h-screen md:pl-70 flex flex-col">
                <div className="max-w-350 mx-auto w-full relative z-20">
                    <TopNavbarPage />
                </div>
                
                <main className="p-6 md:p-8 flex-1 max-w-350 mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}