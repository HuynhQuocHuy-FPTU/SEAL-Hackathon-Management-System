import axiosClient from '../../api/axiosClient'

// get my profile
export const getMyProfile = async () => {
        const response = await axiosClient.get(`/users/me`);
        return response.data;
};

// put update my profile
export const updateMyProfile = async (data: any) => {
        const response = await axiosClient.put(`/users/me`, data);
        return response.data;
};

// change password
export const changePassword = async (data: any) => {
        const response = await axiosClient.put(`/account/change-password`, data);
        return response.data;
};

export const getAccountById = async (accountId: number) => {
        const response = await axiosClient.get(`/admin/users/${accountId}`);
        return response.data.data || response.data;
};

export const updateUserStatus = async (accountId: number, status: string) => {
        const response = await axiosClient.patch(`/admin/users/${accountId}/status`, { status });
        return response.data;
};

export const getAllUsers = async () => {
        const response = await axiosClient.get(`/admin/users`);
        return response.data.data || [];
};

// add user (invite user)
export const addUser = async (userData: any) => {
        const response = await axiosClient.post(`/admin/invite`, userData);
        return response.data;
};


// get admin overview dashboard metrics
export const getAdminOverview = async () => {
        const response = await axiosClient.get(`/admin/overviews`);
        return response.data.data;
};

// get paginated audit logs
export const getAuditLogs = async (page: number, size: number) => {
        const response = await axiosClient.get(`/admin/auditLog`, {
                params: { page, size }
        });
        return response.data;
};
