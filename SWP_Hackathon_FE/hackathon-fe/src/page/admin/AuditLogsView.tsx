import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { Search, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { getAuditLogs } from "../../services/auth/userService";
import type { AuditLogPaginatedResponse, RecentAuditLog } from "../../types/admin/User";

// Hàm xử lý dữ liệu để hiển thị cho cột "Dữ liệu" (Data)
// Hàm này có khả năng phát hiện nếu dữ liệu là chuỗi JSON thì sẽ parse (chuyển đổi) ra dạng Object.
// Đặc biệt: Nếu phát hiện log là hành động "chỉnh sửa điểm" (có chứa biến oldScore và newScore), 
// nó sẽ tự động render ra một giao diện đẹp có điểm cũ (gạch ngang) và điểm mới (màu xanh).
const renderAuditData = (dataString: any) => {
    // Nếu không có dữ liệu gì truyền vào thì in ra dấu gạch ngang
    if (!dataString) return "-";
    
    let parsedData = dataString;
    // Kiểm tra xem dữ liệu truyền vào có phải là một chuỗi (string) hay không
    if (typeof dataString === 'string') {
        try {
            // Cố gắng dịch chuỗi JSON thành một Object trong Javascript
            parsedData = JSON.parse(dataString);
        } catch (e) {
            // Nếu chuỗi không phải là chuẩn JSON (bị lỗi parse), 
            // thì in nguyên văn chuỗi đó ra màn hình trong một cái khung cuộn (scrollable div)
            return <div className="max-w-[200px] max-h-[80px] overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-500" title={dataString}>{dataString}</div>;
        }
    }

    // Nếu dữ liệu đã được dịch thành công ra dạng Object
    if (parsedData && typeof parsedData === 'object') {
        // Tự động tìm kiếm các thuộc tính (keys) liên quan đến điểm số.
        // Dùng toán tử ?? để nếu không có 'oldScore' thì tìm 'previousScore', v.v.
        const oldScore = parsedData.oldScore ?? parsedData.previousScore ?? parsedData.old_score ?? parsedData.oldValue ?? parsedData.oldTotalScore;
        const newScore = parsedData.newScore ?? parsedData.updatedScore ?? parsedData.new_score ?? parsedData.newValue ?? parsedData.newTotalScore ?? parsedData.score;
        
        // Nếu tìm thấy ĐỦ cả điểm cũ và điểm mới trong log
        if (oldScore !== undefined && newScore !== undefined) {
            return (
                // Trả về một khối giao diện HTML hiển thị điểm cũ gạch ngang, điểm mới màu xanh
                <div className="flex flex-col gap-1 font-sans text-xs min-w-[120px]">
                    <span className="text-slate-500 flex items-center gap-1">
                        Điểm cũ: <span className="font-bold text-slate-700 line-through">{oldScore}</span>
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1">
                        Điểm mới: <span className="font-bold">{newScore}</span>
                    </span>
                </div>
            );
        }

        // Trong trường hợp nó là một Object JSON bình thường (không có điểm số),
        // thì in toàn bộ JSON đó ra dưới dạng chuỗi thô, được format thụt đầu dòng (null, 2)
        return (
             <div className="max-w-[200px] max-h-[80px] overflow-y-auto whitespace-pre-wrap font-mono text-[11px] text-slate-500" title={JSON.stringify(parsedData)}>
                  {JSON.stringify(parsedData, null, 2)}
             </div>
        );
    }
    
    // Nếu nó không phải string, cũng không phải object (VD: là số nguyên), thì ép kiểu sang chuỗi để in ra
    return String(parsedData);
};

export default function AuditLogsView() {
    const { showToast } = useApp();
    const [localSearch, setLocalSearch] = useState("");

    // Các State dùng để lưu trữ dữ liệu từ API và các tham số phục vụ phân trang
    const [logsData, setLogsData] = useState<AuditLogPaginatedResponse | null>(null); // Lưu trữ dữ liệu nhật ký lấy từ Backend
    const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu (dùng để hiện chữ "Đang tải dữ liệu...")
    const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (Bắt đầu từ 0, tức là số 0 tương đương trang 1)
    const pageSize = 10; // Số lượng log hiển thị trên 1 trang

    // Hook useEffect này sẽ tự động chạy lại phần code bên trong mỗi khi 'currentPage' (trang hiện tại) 
    // hoặc 'showToast' thay đổi. Nghĩa là cứ bấm sang trang 2, 3 thì nó sẽ tự động load lại Data.
    useEffect(() => {
        let isMounted = true; // Cờ hiệu để tránh tình trạng component đã đóng mà API vẫn báo về gây lỗi
        
        // Khai báo một hàm bất đồng bộ (async) để gọi API
        const fetchLogs = async () => {
            try {
                setLoading(true); // Bật trạng thái loading (hiện chữ Đang tải...)
                // Gọi API lấy dữ liệu từ Server, truyền vào số trang và giới hạn 1 trang
                const data = await getAuditLogs(currentPage, pageSize); 
                
                // Chỉ cập nhật dữ liệu nếu component vẫn còn đang hiện trên màn hình
                if (isMounted) {
                    setLogsData(data); // Đưa dữ liệu lấy được vào state
                }
            } catch (err) {
                // Nếu gọi API thất bại (VD: mất mạng, lỗi server)
                if (isMounted) {
                    showToast("Lỗi khi tải nhật ký hoạt động", "error"); // Hiện thông báo lỗi màu đỏ
                    console.error(err); // In lỗi ra F12 Console để Dev dễ debug
                }
            } finally {
                // Dù gọi API thành công hay thất bại thì khối finally này vẫn chạy
                if (isMounted) setLoading(false); // Tắt trạng thái loading để bắt đầu hiện bảng dữ liệu
            }
        };
        
        fetchLogs(); // Thực thi lệnh gọi API ngay lập tức
        
        // Hàm dọn dẹp (cleanup function): tự động chạy khi component bị hủy (người dùng bấm sang trang khác)
        return () => { isMounted = false; }; 
    }, [currentPage, showToast]); // Đây là Dependencies array, chứa các biến sẽ kích hoạt lại useEffect này

    // Xử lý tìm kiếm ở phía Frontend (Client-side search)
    // Nó sẽ duyệt qua danh sách các log của trang hiện tại và lọc ra những log có chứa từ khóa 
    // trong cột "Hành động" (action) hoặc "Người thực hiện" (actorName).
    const filteredLogs = (logsData?.content || []).filter((log) => {
        const q = localSearch.toLowerCase().trim();
        return !q ||
            (log.action && log.action.toLowerCase().includes(q)) ||
            (log.actorName && log.actorName.toLowerCase().includes(q));
    });

    return (
        <div className="space-y-6 font-sans">
            {/* Top section with actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Nhật ký hoạt động hệ thống</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Xem lại toàn bộ hoạt động của người dùng và trạng thái của hệ thống.
                    </p>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
                {/* Controls, Filters & Search bar rows */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-end gap-4 items-center">
                    {/* Quick Search */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm hoạt động hoặc người dùng..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 bg-white"
                        />
                    </div>
                </div>

                {/* Table representation */}
                <div className="overflow-x-auto min-h-fit">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold w-1/4">Người thực hiện</th>
                                <th className="px-6 py-4 font-semibold w-1/4">Hành động</th>
                                <th className="px-6 py-4 font-semibold w-1/6">Đối tượng</th>
                                <th className="px-6 py-4 font-semibold w-1/6">Dữ liệu</th>
                                <th className="px-6 py-4 font-semibold">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400 font-bold font-sans">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400 font-bold font-sans">
                                        Không có dữ liệu nhật ký phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log: RecentAuditLog) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                                        {/* Logged user */}
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-8.5 h-8.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex items-center justify-center text-xs font-black shrink-0 uppercase tracking-wide leading-none">
                                                {(log.actorName || "SYS").substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 leading-snug">{log.actorName || "Quản trị hệ thống"}</p>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {log.role || "SYSTEM"} {log.accountId ? `(ID: ${log.accountId})` : ""}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Operational Action */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-700 text-sm">{log.action || "-"}</p>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5" title={log.message}>{log.message}</p>
                                        </td>

                                        {/* Entity */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 w-max">
                                                <Activity className="w-3 h-3" />
                                                {log.entityType || "SYSTEM"}
                                            </span>
                                            <div className="mt-1.5 text-[10px] text-slate-500 font-semibold pl-1">
                                                ID: {log.entityId || "N/A"}
                                            </div>
                                        </td>

                                        {/* Data */}
                                        <td className="px-6 py-4 text-[11px] font-mono text-slate-500">
                                            {/* <div
                                                className="max-w-50 max-h-50 overflow-y-auto whitespace-pre-wrap"
                                                title={typeof log.data === 'object' && log.data !== null ? JSON.stringify(log.data) : (log.data || "")}
                                            >
                                                {typeof log.data === 'object' && log.data !== null ? JSON.stringify(log.data, null, 2) : (log.data || "-")}
                                            </div> */}
                                            {renderAuditData(log?.data)}
                                        </td>

                                        {/* Exact Timestamp */}
                                        <td className="px-6 py-4 text-slate-400 text-[11px] font-medium whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                                                month: "2-digit",
                                                day: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit"
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && logsData && logsData.page.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <p className="text-xs font-medium text-slate-500">
                            Đang hiển thị trang <span className="font-bold">{logsData.page.number + 1}</span> trên <span className="font-bold">{logsData.page.totalPages}</span>
                            <span className="ml-2 text-slate-400">({logsData.page.totalElements} tổng số bản ghi)</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                            </button>

                            {/* Đoạn code logic dưới đây dùng để tính toán thuật toán hiển thị phân trang thông minh */}
                            {(() => {
                                const total = logsData.page.totalPages; // Tổng số trang (do Backend trả về)
                                const current = currentPage; // Trang người dùng đang xem
                                const maxVisible = 5; // Chỉ hiển thị tối đa 5 nút số trang ở giữa (VD: 1 ... 4 5 6 7 8 ... 20) để tránh tràn màn hình
                                
                                // start: Tính toán con số bắt đầu để hiển thị. (Trang hiện tại trừ đi một nửa của 5)
                                let start = Math.max(0, current - Math.floor(maxVisible / 2));
                                // end: Tính toán con số kết thúc hiển thị. Không được vượt quá tổng số trang.
                                let end = Math.min(total - 1, start + maxVisible - 1);

                                // Nếu số nút hiển thị bị ít hơn maxVisible (5), thì lùi start lại để đủ 5 nút
                                if (end - start + 1 < maxVisible) {
                                    start = Math.max(0, end - maxVisible + 1);
                                }

                                // Mảng pages dùng để chứa các NÚT HTML (button)
                                const pages = [];
                                for (let i = start; i <= end; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)} // Khi bấm vào nút thì đổi trang
                                            // Điều kiện CSS: Nếu là trang hiện tại thì làm màu xanh, ngược lại màu trắng viền xám
                                            className={`min-w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors cursor-pointer ${currentPage === i
                                                ? "bg-[#F26F21] text-white border-blue-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            {i + 1} {/* Vì currentPage bắt đầu từ 0, nên khi hiển thị phải +1 để ra trang 1, 2, 3... */}
                                        </button>
                                    );
                                }

                                return (
                                    <>
                                        {/* Nếu nút bắt đầu lớn hơn 0, nghĩa là bị khuất nút số 1, thì tự động tạo thêm nút số 1 và dấu "..." */}
                                        {start > 0 && (
                                            <>
                                                <button onClick={() => setCurrentPage(0)} className="min-w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer">1</button>
                                                {start > 1 && <span className="px-1 text-slate-400 font-bold">...</span>}
                                            </>
                                        )}
                                        
                                        {/* In các nút phân trang ở giữa (mảng pages vừa tính bên trên) ra màn hình */}
                                        {pages}
                                        
                                        {/* Nếu nút kết thúc nhỏ hơn tổng số trang, thì tự động thêm dấu "..." và nút trang Cuối cùng */}
                                        {end < total - 1 && (
                                            <>
                                                {end < total - 2 && <span className="px-1 text-slate-400 font-bold">...</span>}
                                                <button onClick={() => setCurrentPage(total - 1)} className="min-w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer">{total}</button>
                                            </>
                                        )}
                                    </>
                                );
                            })()}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(logsData.page.totalPages - 1, p + 1))}
                                disabled={currentPage >= logsData.page.totalPages - 1}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
