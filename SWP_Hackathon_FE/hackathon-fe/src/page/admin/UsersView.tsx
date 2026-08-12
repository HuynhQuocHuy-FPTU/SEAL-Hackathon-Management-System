import React, { useEffect, useState } from 'react';
import {
  Plus,
  ShieldAlert,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  CalendarDays,
  X
} from 'lucide-react';
import type { User } from '../../types/admin/User';
import { getAllUsers, addUser, updateUserStatus } from '../../services/auth/userService';

interface UsersTabProps {
  searchQueryFromHeader?: string;
}

export default function UsersTab({
  searchQueryFromHeader = '',
}: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  // State quản lý bộ lọc
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // State quản lý Modal chi tiết người dùng
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalSchool, setModalSchool] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalUsername, setModalUsername] = useState('');
  const [modalRole, setModalRole] = useState<string>('Student');

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setModalSchool(user.university || '');
    setModalName(user.fullName || '');
    setModalEmail(user.email);
    setModalUsername(user.email || '');
    setModalRole(user.role);
  };

  // State quản lý Form thêm người dùng
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('EXPERT');
  const [formError, setFormError] = useState('');

  // Kết hợp từ khóa tìm kiếm (từ Header bar và Input tại trang)
  const activeQuery = (localSearch || searchQueryFromHeader || '').toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesKeyword =
      (user.fullName || '').toLowerCase().includes(activeQuery) ||
      (user.email || '').toLowerCase().includes(activeQuery) ||
      (user.accountId?.toString() || '').toLowerCase().includes(activeQuery) ||
      (user.university || '').toLowerCase().includes(activeQuery);

    const matchesRole = roleFilter === 'ALL' || (user.role || '').toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || (user.status || '').toUpperCase() === statusFilter.toUpperCase();

    return matchesKeyword && matchesRole && matchesStatus;
  });

  // Fetch danh sách người dùng từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUsers = await getAllUsers();
        console.log('FIRST USER DATA:', apiUsers.length > 0 ? apiUsers[0] : 'No users');
        setUsers(apiUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    if (!newUserEmail.includes('@') || !newUserEmail.includes('.')) {
      setFormError('Vui lòng nhập email hợp lệ.');
      return;
    }

    try {
      await addUser({
        fullName: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
      });

      // Reload lại danh sách sau khi thêm thành công
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);

      // Xóa form (Reset)
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('EXPERT');
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Add user error:', error.response?.data);
      const errObj = error.response?.data;
      const backendMsg = errObj?.message || errObj?.error || (errObj ? JSON.stringify(errObj) : 'Lỗi khi thêm người dùng. Vui lòng thử lại.');
      setFormError(backendMsg);
    }
  };

  const getOverlayAvatarColor = (role: string) => {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'COORDINATOR':
      case 'EVENTCOORDINATOR': return 'bg-cyan-100 text-cyan-800';
      case 'EXPERT': return 'bg-purple-100 text-purple-800';
      case 'STUDENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatSafeDate = (dateVal: any) => {
    if (!dateVal) return 'Unknown';
    try {
      let d: Date;
      if (Array.isArray(dateVal)) {
        // Dữ liệu ngày trả về từ Spring Boot có dạng mảng: [năm, tháng, ngày, giờ, phút, ...]
        d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
      } else {
        d = new Date(dateVal);
      }
      if (isNaN(d.getTime())) return 'Unknown';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">

      {/* Phần Tiêu đề (Header) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Quản lý người dùng</h2>
          <p className="text-[#727785] text-sm">Kiểm duyệt, xác thực và thay đổi quyền truy cập cho người dùng trong hệ thống.</p>
        </div>

        <button
          id="btn-add-user"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#F26F21] hover:brightness-110 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>{showAddForm ? 'Đóng' : 'Thêm người dùng mới'}</span>
        </button>
      </div>

      {/* Khung Form Đăng ký người dùng mới */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-6 rounded-xxl border border-[#e5e7eb] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn"
        >
          <div className="md:col-span-3 pb-2 border-b border-[#e5e7eb]">
            <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-primary" />
              <span>Đăng ký người dùng mới (Mật khẩu sẽ được gửi qua email)</span>
            </h3>
          </div>

          {/* Tên */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#424754]">Họ và tên</label>
            <input
              id="new-user-name"
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:bg-white outline-none"
              placeholder="e.g. Brenda Stark"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#424754]">Địa chỉ Email</label>
            <input
              id="new-user-email"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:bg-white outline-none"
              placeholder="brenda.stark@university.edu"
              required
            />
          </div>

          {/* Chọn Vai trò (Role) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#424754]">Vai trò cấp phát</label>
            <select
              id="new-user-role"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none cursor-pointer"
            >
              <option value="EXPERT">Chuyên gia (Giám khảo / Cố vấn)</option>
              <option value="EVENTCOORDINATOR">Ban tổ chức</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          {formError && (
            <div className="md:col-span-3 text-xs font-semibold text-error px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
              {formError}
            </div>
          )}

          <div className="md:col-span-3 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-[#f3f4f5] border border-[#e5e7eb] rounded-xl text-xs font-semibold hover:bg-[#edeeef]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F26F21] hover:brightness-110 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Thanh Công Cụ (Bộ lọc & Tìm kiếm) */}
      <div className="bg-white p-4 rounded-xxl border border-[#e5e7eb] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          {/* Ô Tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727785] w-4 h-4" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#f3f4f5] border-0 rounded-lg text-xs placeholder-[#727785] focus:ring-1 focus:ring-primary outline-none"
              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
            />
          </div>

          {/* Bộ lọc Vai trò */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#727785]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f3f4f5] border-0 rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="Student">Sinh viên</option>
              <option value="Expert">Giám khảo / Cố vấn</option>
              <option value="Coordinator">Ban tổ chức</option>
              <option value="Admin">Quản trị viên</option>
            </select>
          </div>

          {/* Bộ lọc Trạng thái */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f3f4f5] border-0 rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setLocalSearch('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-[#edeeef] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Bỏ lọc</span>
          </button>
          <span className="text-xs text-[#727785] py-1.5 px-3 font-medium bg-[#f3f4f5] rounded-lg">
            Tìm thấy {filteredUsers.length} người dùng
          </span>
        </div>
      </div>

      {/* Bảng Dữ Liệu (Data Table) */}
      <div className="bg-white rounded-xxl border border-[#e5e7eb] shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f5]/65 text-xs text-[#727785] uppercase tracking-wider font-extrabold border-b border-[#e5e7eb]">
                <th className="px-6 py-4 font-bold">Người dùng</th>
                <th className="px-6 py-4 font-bold">Vai trò</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold">Ngày tham gia</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#727785] font-medium">
                    Không tìm thấy người dùng nào phù hợp. Vui lòng thử lại.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <tr key={user.accountId} className="hover:bg-[#f3f4f5]/25 transition-colors duration-150">

                      {/* Cột Thông tin cá nhân */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs ${getOverlayAvatarColor(user.role)}`}>
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <span className="font-bold text-on-surface block">{user.fullName || 'Unknown'}</span>
                            <span className="text-xs text-[#727785] flex items-center gap-1">
                              <Mail size={11} />
                              <span>{user.email}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột Vai trò */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${(user.role || '').toUpperCase() === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                            (user.role || '').toUpperCase() === 'COORDINATOR' || (user.role || '').toUpperCase() === 'EVENTCOORDINATOR' ? 'bg-cyan-50 text-cyan-750 border-cyan-200' :
                              (user.role || '').toUpperCase() === 'EXPERT' || (user.role || '').toUpperCase() === 'MENTOR' ? 'bg-purple-50 text-purple-750 border-purple-200' :
                                'bg-blue-50 text-primary border-blue-200'
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Cột Trạng thái */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${(user.status || '').toUpperCase() === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                          <span className="text-xs font-semibold capitalize text-on-surface">
                            {(user.status || '').toUpperCase() === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Cột Ngày tham gia */}
                      <td className="px-6 py-4 text-[#727785] text-xs font-medium font-mono">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={12} />
                          <span>{formatSafeDate(user.createdAt)}</span>
                        </span>
                      </td>

                      {/* Cột Thao tác */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          title={`Xem chi tiết ${user.fullName}`}
                        >
                          <span>Xem</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi tiết Người dùng (Popup) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn px-4">
          <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-xl max-w-md w-full overflow-hidden animate-scaleUp">
            {/* Header của Modal */}
            <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center bg-gradient-to-r from-[#f3f4f5]/50 to-white">
              <h3 className="font-extrabold text-[#111827] text-base">Chi tiết người dùng & Chỉnh sửa</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#727785] hover:text-black hover:bg-[#f3f4f5] p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Phần Thân (Body) */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Tóm tắt Profile */}
              <div className="flex flex-col items-center text-center space-y-2 pb-3 border-b border-[#f3f4f5]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-md border-4 border-white ${getOverlayAvatarColor(modalRole)}`}>
                  {getInitials(modalName || 'U')}
                </div>
                <div>
                  <h4 className="font-bold text-base text-on-surface">{modalName || 'User'}</h4>
                  <div className="flex gap-2 justify-center items-center mt-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${modalRole === 'Admin' ? 'bg-red-50 text-red-700 border-red-200' :
                      modalRole === 'Coordinator' ? 'bg-cyan-50 text-cyan-750 border-cyan-200' :
                        modalRole === 'Expert' ? 'bg-purple-50 text-purple-750 border-purple-200' :
                          'bg-blue-50 text-primary border-blue-200'
                      }`}>
                      {modalRole}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    <span className="text-xs font-semibold capitalize text-[#727785]">
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Các trường thông tin (Lưới) */}
              <div className="space-y-3 text-xs font-medium">
                {/* Họ và tên */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#424754] font-bold">Họ và tên</label>
                  <input
                    type="text"
                    value={modalName}
                    readOnly
                    className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none font-semibold text-on-surface cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Địa chỉ Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#424754] font-bold">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={modalEmail}
                    readOnly
                    className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none font-medium text-on-surface cursor-not-allowed opacity-80"
                  />
                </div>

                {/* Username & Trường Đại học */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#424754] font-bold">Account / Username</label>
                    <input
                      type="text"
                      value={modalUsername}
                      readOnly
                      className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none font-mono font-semibold text-on-surface cursor-not-allowed opacity-80"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#424754] font-bold">Trường học / Đại học</label>
                    <input
                      type="text"
                      value={modalSchool}
                      readOnly
                      className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none font-semibold text-on-surface cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                {/* Vai trò & Ngày tạo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#424754] font-bold">Vai trò hệ thống</label>
                    <div className="px-3 py-2 bg-[#f3f4f5] border border-[#c2c6d6]/60 rounded-xl text-xs outline-none font-bold text-on-surface opacity-80 flex items-center">
                      {modalRole}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#424754] font-bold">Ngày tạo</label>
                    <span className="text-on-surface font-semibold flex items-center gap-1.5 font-mono text-[11px] py-2">
                      <CalendarDays size={13} className="text-[#a1a5b3]" />
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Oct 24, 2023'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Khu vực nút bấm (Footer) */}
            <div className="p-6 bg-[#f3f4f5]/40 border-t border-[#e5e7eb] flex justify-between items-center gap-3">
              <div>
                {(selectedUser.status || '').toUpperCase() === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const accountIdStr = String(selectedUser.accountId);
                      const updatedUser: User = { ...selectedUser, status: 'inactive' };
                      // Cập nhật UI tạm thời để có cảm giác phản hồi nhanh (Optimistic Update)
                      setUsers(prev => prev.map(u => String(u.accountId) === accountIdStr ? { ...u, status: 'inactive' } : u));
                      setSelectedUser(updatedUser);
                      try {
                        await updateUserStatus(Number(accountIdStr), 'inactive');
                      } catch (error) {
                        console.error('Error banning user in API:', error);
                        // Lùi lại (Rollback) UI nếu API gọi thất bại
                        setUsers(prev => prev.map(u => String(u.accountId) === accountIdStr ? { ...u, status: 'active' } : u));
                        setSelectedUser(selectedUser);
                      }
                    }}
                    className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Ban / Suspend Account Access"
                  >
                    <ShieldAlert size={14} />
                    <span>Khóa tài khoản</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const accountIdStr = String(selectedUser.accountId);
                      const updatedUser: User = { ...selectedUser, status: 'active' };
                      // Cập nhật UI tạm thời để có cảm giác phản hồi nhanh (Optimistic Update)
                      setUsers(prev => prev.map(u => String(u.accountId) === accountIdStr ? { ...u, status: 'active' } : u));
                      setSelectedUser(updatedUser);
                      try {
                        await updateUserStatus(Number(accountIdStr), 'active');
                      } catch (error) {
                        console.error('Error unbanning user in API:', error);
                        // Lùi lại (Rollback) UI nếu API gọi thất bại
                        setUsers(prev => prev.map(u => String(u.accountId) === accountIdStr ? { ...u, status: 'inactive' } : u));
                        setSelectedUser(selectedUser);
                      }
                    }}
                    className="px-3.5 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Reactivate Account Access"
                  >
                    <ShieldAlert size={14} />
                    <span>Mở khóa tài khoản</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-[#f3f4f5] border border-[#e5e7eb] hover:bg-[#edeeef] rounded-xl text-xs font-bold text-on-surface transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
