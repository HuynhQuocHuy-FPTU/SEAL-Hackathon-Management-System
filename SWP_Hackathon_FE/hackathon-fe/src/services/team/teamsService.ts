import axiosClient from '../../api/axiosClient'
import type { TeamCreate } from '../../types/team/TeamCreate';
import type { CreateDirectTeamRequest, ProcessRequest, TeamRequest } from '../../types/team/TeamRequest'

export const createTeam = async (teamData: TeamCreate) => {
    const res = await axiosClient.post('/teams/create', teamData);
    return res.data;
};

export const acceptInvitation = async (notiId: number) => {
    const res = await axiosClient.post(`/teams/invitations/${notiId}/accept`);
    return res.data;
};

export const rejectInvitation = async (notiId: number) => {
    const res = await axiosClient.post(`/teams/invitations/${notiId}/reject`);
    return res.data;
};

export const getTeamDetail = async () => {
    const res = await axiosClient.get('/teams/members/view-team-member-detail');
    return res.data;
}

export const sendInvitation = async (teamId: number, memberEmails: string[]) => {
    const res = await axiosClient.post("/teams/invitations", {
        teamId,
        memberEmails
    });
    return res.data;
}

//config api
export const updateTeamName = async (teamName: string) => {
    const res = await axiosClient.put(`/teams/update/teams-name?teamName=${teamName}`);
    return res.data;
}

export const leaveTeam = async (teamId: number) => {
    const res = await axiosClient.post(`/teams/${teamId}/leave`);
    return res.data;
}

export const tranferLeader = async (teamId: number, TeamRequest: TeamRequest) => {
    const res = await axiosClient.put(`/teams/${teamId}/transfer-leader`, TeamRequest);
    return res.data;
}


export const registerEvent = async (eventId: number) => {
    const res = await axiosClient.post(`/registrations/${eventId}/register-event`);
    return res.data;
}
//Joined event
export const getTeamCurrentEvent = async () => {
    const res = await axiosClient.post("/teams/category-round");
    return res.data;
}

export const submitSubmission = async (
    roundId: number,
    githubUrl: string,
    files: File[]
) => {
    const formData = new FormData();

    if (githubUrl) {
        formData.append("githubUrl", githubUrl);
    }

    files.forEach((file) => {
        formData.append("files", file);
    });

    const res = await axiosClient.post(
        `/submissions/${roundId}/create`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );

    return res.data;
};

export const chooseFinalSubmission = async (submissionId: number) => {
    const res = await axiosClient.patch(`/submissions/choose-final/${submissionId}`);
    return res.data;
}

export const getEvaluatedSubmission = async (categoryRoundId: number) => {
    const res = await axiosClient.get(`/submissions/evluated/${categoryRoundId}`);
    return res.data;
}

export const getSubmissionByRoundId = async (roundId: number) => {
    const res = await axiosClient.get(`/submissions/leader/${roundId}`);
    return res.data;
}

export const getAllSubmissions = async () => {
    const res = await axiosClient.get("submissions/all");
    return res.data;
}

export const getAllSubmissionByRoundId = async (roundId: number) => {
    const res = await axiosClient.get(`/submissions/leader/${roundId}`);
    return res.data;
}

export const getSubmsisionEvaluatedDetail = async (submissionId: number) => {
    const res = await axiosClient.get(`/submissions/${submissionId}/evaluatedDetail`);
    return res.data;
}

export const getCurrentRound = async () => {
    const res = await axiosClient.get("/participants/student/current");
    return res.data;
}
//Team send request for mentor
export const sendRequestMentor = async (roundId: number, requestMessage: string) => {
    const res = await axiosClient.post("/team-request", {
        roundId,
        requestMessage
    });
    return res.data;
};
//Process request
export const processRequest = async (requestId: number, process: ProcessRequest) => {
    const res = await axiosClient.patch(`/team-request/${requestId}/process`, process);
    return res.data;
}

//Team send appeal
export const sendAppeal = async (roundId: number, requestMessage: string) => {
    const res = await axiosClient.post("/team-request/appeal", {
        roundId,
        requestMessage
    });
    return res.data;
}

export const viewAppeals = async (eventId: number) => {
    const res = await axiosClient.get(`/team-request/${eventId}/appeals/student`)
    return res.data;
}

export const createDirectRequest = async (createDirectTeamRequest: CreateDirectTeamRequest) => {
    const res = await axiosClient.post("/team-request/direct", createDirectTeamRequest);
    return res.data;
}

export const getTeamAppeals = async (roundId: number) => {
    const res = await axiosClient.get(`/team-request/applicaion/view-all/${roundId}`);
    return res.data;
}
export const getHistoryStudent = async () => {
    const res = await axiosClient.get(`/historty/student/{studentId}`)
    return res.data;
}

export const viewPrize = async (eventId: number) => {
    const res = await axiosClient.get(`/prize/${eventId}/prize`);
    return res.data;
}

export const trackingRegistration = async () => {
    const res = await axiosClient.get("/registrations/history/current-team");
    return res.data;
}