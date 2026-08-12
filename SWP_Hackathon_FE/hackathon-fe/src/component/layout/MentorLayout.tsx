import { Outlet } from "react-router-dom";
import TopNavbarPage, { MENTOR_NAV_ITEMS } from "../navbar/TopNavbarPage";
import SidebarMentor from "./SidebarMentor";

interface MentorLayoutProps {
    userProfile?: any;
    onUpdateProfile?: () => void;
    onLogout?: () => void;
}


export default function MentorLayout({ userProfile, onUpdateProfile, onLogout }: MentorLayoutProps) {
    return (
        <div className="min-h-screen bg-brand-background text-brand-on-surface font-sans flex antialiased select-none">

            <SidebarMentor />

            <div className="flex-1 min-w-0 md:pl-64 flex flex-col min-h-screen">

                <div className="max-w-310 w-full mx-auto relative z-20">
                    <TopNavbarPage
                        userProfile={userProfile}
                        onUpdateProfile={onUpdateProfile}
                        onLogout={onLogout}
                    />
                </div>

                <main className="flex-1 max-w-310 w-full mx-auto px-6 md:px-8 py-8 pb-16">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}