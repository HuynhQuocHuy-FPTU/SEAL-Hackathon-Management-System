import axiosClient from '../../api/axiosClient';

export const updateSystemConfig = async (key: string, value: number) => {
    const response = await axiosClient.put('/admin/system-config', {}, {
        params: {
            key,
            value
        }
    });
    return response.data;
};
