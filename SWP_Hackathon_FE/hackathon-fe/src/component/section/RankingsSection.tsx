import { Activity, Users, Zap } from "lucide-react";

type RankingsSectionProps = {
    leaderboard: any[];
    handleSimulateScoring: () => void;
};

export default function RankingsSection({
    leaderboard,
    handleSimulateScoring,
}: RankingsSectionProps) {
    return (
        <section className="py-20 bg-white" id="rankings">
            <div className="max-w-200 mx-auto px-6 text-center">
                <div className="mb-4 inline-flex items-center gap-1 px-3 py-1 bg-purple-50 border border-purple-150 text-purple-600 text-xs font-semibold rounded-full">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span>Real-time Scoring Board</span>
                </div>

                <h2 className="font-sans text-3xl font-bold text-slate-900 mb-3">Leaderboard Preview</h2>
                <p className="font-sans text-slate-500 max-w-md mx-auto text-sm mb-10">
                    Bảng xếp hạng danh giá hội tụ các đội thi xuất sắc nhất hiện tại của mùa giải đang phát trực tiếp.
                </p>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {leaderboard.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center p-6 hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="w-10 font-sans text-lg font-extrabold text-blue-600 whitespace-nowrap">
                                    #{item.rank}
                                </div>

                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-4 shrink-0 shadow-inner ${item.bgColorClass}`}>
                                    <Users className={`w-5 h-5 ${item.textColorClass}`} />
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-sans text-sm font-bold text-slate-800 leading-tight truncate">{item.name}</h4>
                                    <p className="font-sans text-xs text-slate-400 mt-1 truncate">Dự án: {item.project}</p>
                                </div>

                                <div className="font-sans text-sm font-extrabold text-slate-900 tabular-nums">
                                    {item.points.toLocaleString("vi-VN")} pts
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simulated Live Scoring Trigger controller */}
                    <div className="p-5 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <span className="text-slate-400 font-medium">Bấm trigger cập nhật điểm ngẫu nhiên để mô phỏng tính năng realtime</span>

                        <button
                            onClick={handleSimulateScoring}
                            className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-purple-750 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Simulate Score Update</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

    );
}