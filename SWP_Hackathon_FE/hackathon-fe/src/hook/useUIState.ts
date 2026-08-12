import { useState } from "react";
import type { Hackathon } from "../types/hackathonEvent/Hackathon";

export const useUIState = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [projectSearch, setProjectSearch] = useState("");

    const [selectedTimelineStep, setSelectedTimelineStep] = useState<number | null>(1);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [registerTargetHackathonId, setRegisterTargetHackathonId] =
        useState("seal-global-2024");

    const [isSubmitProjectOpen, setIsSubmitProjectOpen] = useState(false);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [isAiOpen, setIsAiOpen] = useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 5000);
    };

    return {
        activeTab,
        setActiveTab,

        selectedHackathon,
        setSelectedHackathon,

        selectedCategory,
        setSelectedCategory,

        projectSearch,
        setProjectSearch,

        selectedTimelineStep,
        setSelectedTimelineStep,

        isRegisterOpen,
        setIsRegisterOpen,

        registerTargetHackathonId,
        setRegisterTargetHackathonId,

        isSubmitProjectOpen,
        setIsSubmitProjectOpen,

        toastMessage,
        setToastMessage,

        isAiOpen,
        setIsAiOpen,

        showToast,
    };
};