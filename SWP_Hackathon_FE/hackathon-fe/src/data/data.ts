/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Submission } from '../types/team/Submission'
export const INITIAL_PROJECTS: Submission[] = [
];


export const TIMELINE_STEPS = [
    {
        step: 1,
        title: "Đăng ký",
        sub: "Đăng ký tài khoản và thông tin cá nhân.",
        week: "Tuần 1-2",
        colorClass: "bg-[#F26F21] text-white",
        badgeClass: "text-blue-600 bg-blue-50 border border-blue-200",
        description: "Các thí sinh tự do đăng ký tài khoản trên hệ thống SEAL, bổ sung thông tin cá nhân quan trọng như Chuyên ngành, Trường học, Kinh nghiệm, Dự án đã từng làm để tạo hồ sơ kỹ năng cá nhân nổi bật."
    },
    {
        step: 2,
        title: "Lập nhóm",
        sub: "Tìm kiếm đồng đội và thành lập nhóm.",
        week: "Tuần 3",
        colorClass: "bg-purple-600 text-white",
        badgeClass: "text-purple-600 bg-purple-50 border border-purple-200",
        description: "Thời gian vàng ghép nối! Hệ thống cho phép duyệt qua hồ sơ của các thí sinh đang rảnh rỗi hoặc tìm người có mảnh ghép trống (VD: Tìm Frontend Developer, Designer). Tổ chức các buổi Net-working thu nhỏ."
    },
    {
        step: 3,
        title: "Nộp dự án",
        sub: "Phát triển dự án và nộp bài dự thi.",
        week: "Tuần 4-6",
        colorClass: "bg-cyan-600 text-white",
        badgeClass: "text-cyan-600 bg-cyan-50 border border-cyan-200",
        description: "Nhóm lập sơ đồ kiến trúc, code liên tục, triển khai chạy thử. Nộp đường link Github cùng liên kết chạy thử UI, video giới thiệu 3 phút, tài liệu thuyết minh sản phẩm thông qua nộp bài trực tuyến."
    },
    {
        step: 4,
        title: "Đánh giá",
        sub: "Ban giám khảo chấm điểm các dự án.",
        week: "Tuần 7",
        colorClass: "bg-[#F26F21] text-white",
        badgeClass: "text-blue-600 bg-blue-50 border border-blue-200",
        description: "Hội đồng Ban giám khảo bao gồm các Tiến sĩ khoa học máy tính và CTO, Chuyên gia cao cấp các Tech-corp đánh giá dựa trên: Tính Đột phá, Mức độ hoàn thiện, Bảo mật và Giá trị Thực tiễn đem lại."
    },
    {
        step: 5,
        title: "Kết quả",
        sub: "Công bố kết quả và trao giải.",
        week: "Tuần 8",
        colorClass: "bg-purple-600 text-white",
        badgeClass: "text-purple-600 bg-purple-50 border border-purple-200",
        description: "Tổ chức Đêm GALA Vinh quang quy tụ các nhà đầu tư lớn. Trình bày sản phẩm trước Ban giám khảo trực tiếp quốc tế, trao giải thưởng tiền mặt hấp dẫn kèm cơ cấu học bổng ươm mầm khởi nghiệp công nghệ."
    }
];