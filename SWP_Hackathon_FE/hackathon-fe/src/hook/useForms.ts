import { useState } from "react";

export const useForms = () => {
    const [regForm, setRegForm] = useState({
        fullName: "",
        email: "",
        role: "Fullstack Developer",
        teamName: "",
        description: "",
    });

    const [projForm, setProjForm] = useState({
        title: "",
        team: "",
        category: "AI",
        tagsStr: "AI, Hackathon",
        imageUrl: "",
        description: "",
        githubUrl: "",
        demoUrl: "",
        membersStr: ""
    });

    const resetRegForm = () =>
        setRegForm({
            fullName: "",
            email: "",
            role: "Fullstack Developer",
            teamName: "",
            description: "",
        });

    const resetProjForm = () =>
        setProjForm({
            title: "",
            team: "",
            category: "AI",
            tagsStr: "AI, Hackathon",
            imageUrl: "",
            description: "",
            githubUrl: "",
            demoUrl: "",
            membersStr: ""
        });

    return {
        regForm, setRegForm,
        projForm, setProjForm,
        resetRegForm,
        resetProjForm,
    };
};