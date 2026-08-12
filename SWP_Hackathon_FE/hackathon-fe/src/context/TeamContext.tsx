import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TeamDetail } from '../types/team/TeamDetail';
import { getTeamDetail } from '../services/team/teamsService';
import { useAuthContext } from '../hook/useAuthContext';

interface TeamContextType {
    teamDetail: TeamDetail;
    isLoading: boolean;
    refreshTeamData: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const [teamDetail, setTeamDetail] = useState<TeamDetail>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { user } = useAuthContext();

    const fetchTeamData = async () => {
        if (user?.role?.toUpperCase() !== 'STUDENT') {
            setIsLoading(false);
            setTeamDetail(undefined);
            return;
        }

        setIsLoading(true);
        try {
            const res = await getTeamDetail();
            setTeamDetail(res.data);
        } catch (error: any) {
            setTeamDetail(undefined);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [user]);

    return (
        <TeamContext.Provider value={{ teamDetail, isLoading, refreshTeamData: fetchTeamData }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error("useTeamContext must be used within a TeamProvider");
    }
    return context;
};
