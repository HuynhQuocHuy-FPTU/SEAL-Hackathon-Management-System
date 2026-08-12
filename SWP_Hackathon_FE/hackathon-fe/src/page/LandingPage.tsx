import { useEffect, useState } from "react";
import { TIMELINE_STEPS } from "../data/data";
import type { Hackathon, PublicStatis } from '../types/hackathonEvent/Hackathon';
import Navbar from "../component/layout/Navbar";
import Footer from "../component/layout/Footer";
import HeroSection from "../component/section/HeroSection";
import EventSection from "../component/section/EventSection";
import RankingSection from "../component/section/RankingSection";
import TimelineSection from "../component/section/TimelineSection";
import EventDetailModal from "../component/modals/EventDetailModal";
import { useUIState } from "../hook/useUIState";
import { useAuthContext } from '../hook/useAuthContext'
import CreateTeamModal from "../component/modals/CreateTeamModal";
import ViewActiveTeamsModal from "../component/modals/ViewActiveTeamsModal";
import { useTheme } from "../context/ThemeContext";
import { getAllPublicEvents, getPublicstatis } from "../services/event/eventService";

export default function LandingPage() {
    const ui = useUIState();
    const [isOpen, setIsOpen] = useState(false);
    const [isViewTeamsOpen, setIsViewTeamsOpen] = useState(false);
    const { user, logout } = useAuthContext();
    const { isDark } = useTheme();
    const [events, setEvents] = useState<Hackathon[]>([]);
    const [statis, setStatis] = useState<PublicStatis>();
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const [eventsData, statisData] = await Promise.all([
                    getAllPublicEvents().catch(() => []),
                    getPublicstatis().catch(() => ({}))
                ]);
                setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.data || []));
                setStatis(statisData?.data !== undefined ? statisData.data : statisData);
            } catch (error: any) {
                console.error(error?.response?.data?.message);
            }
        }
        fetchEvents();
    }, []);
    const handleViewDetails = (hackathon: Hackathon) => {
        ui.setSelectedHackathon(hackathon);
    };
    const handleOpenRegister = (hackathonId: string) => {
        ui.setRegisterTargetHackathonId(hackathonId);
        ui.setSelectedHackathon(null);
        ui.setIsRegisterOpen(true);
    };
    return (
        <div className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500 ${isDark ? 'bg-[#080c14] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar
                handleOpenRegister={handleOpenRegister}
                user={user}
                setIsOpen={setIsOpen}
                setIsViewTeamsOpen={setIsViewTeamsOpen}
                onLogout={logout}

            />
            <CreateTeamModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
            <ViewActiveTeamsModal
                isOpen={isViewTeamsOpen}
                onClose={() => setIsViewTeamsOpen(false)}
                isDark={isDark}
            />
            {/* Hero Section */}
            <HeroSection
                handleOpenRegister={handleOpenRegister}
                statis={statis}
            />
            <EventSection
                hackathons={events}
                handleViewDetails={handleViewDetails}
                handleOpenRegister={handleOpenRegister}
            />

            {/* Ranking Section */}
            <RankingSection events={events} isDark={isDark} />

            {/* Interactive Timeline Walkthrough */}
            <TimelineSection
                TIMELINE_STEPS={TIMELINE_STEPS}
                selectedTimelineStep={ui.selectedTimelineStep}
                setSelectedTimelineStep={ui.setSelectedTimelineStep}
            />
            <Footer />
            <EventDetailModal
                selectedHackathon={ui.selectedHackathon}
                setSelectedHackathon={ui.setSelectedHackathon}
                handleOpenRegister={handleOpenRegister}
            />
        </div>
    );
}
