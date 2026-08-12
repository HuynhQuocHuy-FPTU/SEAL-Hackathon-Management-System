export default function SupportPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
      <div>
        <h3 className="font-bold text-gray-950 text-base">Sách hướng dẫn người điều phối (Coordinator Handbook)</h3>
        <p className="text-xs text-gray-500 mt-0.5">Hiểu và vận hành toàn bộ quy định cạnh tranh một cách an toàn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F26F21]"></span>
            Gia hạn / Khóa Deadline
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Truy cập thẻ <strong>Rounds &amp; Deadlines</strong> để điều khiển quy chế đóng mở cổng nộp bài. Bạn có thể gia hạn linh hoạt thêm các khoảng giờ nhất định hoặc đóng gói nộp bài trực diện ngay lập tức bằng nút bấm <strong>Khóa nộp bài</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F26F21]"></span>
            Loại đội thi (Disqualify Team)
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Tại thẻ <strong>Teams &amp; Registration</strong>, tất cả đội vi phạm điều lệ (ví dụ: đạo nhái, không tham dự checkpoint, v.v.) có thể bị chuyển đổi diện Cấm thi đấu (Disqualified). Bạn bắt buộc phải ghi rõ lý do để hệ thống gửi thư điện tử cho đội trưởng.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F26F21]"></span>
            Cấu hình trọng số Rubrics
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Tại tab <strong>Scoring &amp; Rules</strong>, hãy chắc chắn phân bố tỷ trọng hệ số % đạt đúng tổng cộng 100/100. Điều này đảm bảo thuật toán phân bổ thứ hạng luôn khớp với thang tiêu chí.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F26F21]"></span>
            Cố vấn &amp; Giám khảo
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Phần <strong>Judge &amp; Mentor Assignment</strong> tự động hiển thị mốc % Utilization Rate của các cố vấn, tương đương với số đội được giao phó, giúp bạn trải đều gánh nặng học thuật phù hợp cho từng thành viên.
          </p>
        </div>
      </div>
    </div>
  );
}
