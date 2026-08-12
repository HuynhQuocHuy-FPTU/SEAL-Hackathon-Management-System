import { AnimatePresence, motion } from "framer-motion";
import { X, Zap, Calendar, MapPin, Users, Target, Clock, AlertCircle, PrinterCheck, Trophy, FlowerIcon, TrendingUp, BadgeCheck, BadgeDollarSign } from "lucide-react";
import type { Hackathon } from "../../types/hackathonEvent/Hackathon";

type EventDetailModalProps = {
    selectedHackathon: Hackathon | null;
    setSelectedHackathon: (hackathon: Hackathon | null) => void;
    handleOpenRegister: (id: string) => void;
};

export default function EventDetailModal({
    selectedHackathon,
    setSelectedHackathon,
    handleOpenRegister,
}: EventDetailModalProps) {
    if (!selectedHackathon) return null;

    const categories = Array.isArray(selectedHackathon.categories) ? selectedHackathon.categories : [];
    const experts = [
        ...new Set(
            selectedHackathon.rounds.flatMap(round =>
                round.categoryExperts.flatMap(categoryExpert =>
                    categoryExpert.experts.map(expert => expert.expertName)
                )
            )
        )
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
                    onClick={() => setSelectedHackathon(null)}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    className="relative bg-white/95 backdrop-blur-xl rounded-4xl w-full max-w-5xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col text-sm text-slate-700 z-10"
                >
                    {/* Header block with banner */}
                    <div className="h-64 sm:h-80 bg-slate-900 relative shrink-0 group overflow-hidden rounded-t-4xl">
                        <img
                            alt={selectedHackathon.eventName}
                            className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
                            src={selectedHackathon.bannerUrl}
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col gap-3"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xl">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        {selectedHackathon.status === "ACTIVE" || selectedHackathon.status === "ONGOING" ? "Mở đăng ký" : selectedHackathon.status}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold backdrop-blur-md">
                                        <Target className="w-3.5 h-3.5" />
                                        {selectedHackathon.title}
                                    </div>
                                </div>
                                <h3 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                    {selectedHackathon.eventName}
                                </h3>
                            </motion.div>
                        </div>

                        <button
                            onClick={() => setSelectedHackathon(null)}
                            className="absolute top-6 right-6 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer z-30 border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 space-y-10">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-12 relative z-20">
                            {[
                                { icon: MapPin, label: "Địa điểm", value: selectedHackathon.address || "Online", color: "text-rose-500", bg: "bg-rose-50 border-rose-100" },
                                { icon: Calendar, label: "Thời gian", value: `${new Date(selectedHackathon.startDate).toLocaleDateString()} - ${new Date(selectedHackathon.endDate).toLocaleDateString()}`, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
                                { icon: Users, label: "Đội thi", value: `${selectedHackathon.minTeamSize} - ${selectedHackathon.maxTeamSize} người`, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
                                { icon: Clock, label: "Hạn đăng ký", value: new Date(selectedHackathon.registrationDeadline).toLocaleDateString(), color: "text-amber-500", bg: "bg-amber-50 border-amber-100" }
                            ].map((stat, idx) => (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    key={idx}
                                    className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} border flex items-center justify-center shrink-0`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">{stat.label}</span>
                                        <strong className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 leading-tight">{stat.value}</strong>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {categories.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Hạng mục thi đấu
                                </h4>
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    {categories.map((cat, idx) => (
                                        <span key={idx} className="bg-orange-30/80 text-black border border-orange-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-amber-50 transition-all cursor-default">
                                            {cat.categoryName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedHackathon.description.prizes && selectedHackathon.description.prizes.length > 0 && (
                            <section className="space-y-4">
                                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Phần thưởng
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:grid-cols-1">
                                    {selectedHackathon.description.prizes.map((prize, idx) => {
                                        const isFirst = idx === 0;
                                        const isSecond = idx === 1;
                                        const isThird = idx === 2;

                                        const colors = isFirst
                                            ? { iconBg: 'bg-amber-100', iconText: 'text-amber-600', valText: 'text-amber-600 flex flex-row gap-2' }
                                            : isSecond
                                                ? { iconBg: 'bg-slate-200', iconText: 'text-slate-600', valText: 'text-slate-700 flex flex-row gap-2' }
                                                : isThird
                                                    ? { iconBg: 'bg-orange-100', iconText: 'text-orange-600', valText: 'text-orange-600 flex flex-row gap-2' }
                                                    : { iconBg: 'bg-orange-100', iconText: 'text-[#F26F21]', valText: 'text-[#F26F21] flex flex-row gap-2' };

                                        return (
                                            <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-white hover:shadow-sm hover:border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${colors.iconBg} ${colors.iconText} flex items-center justify-center shrink-0`}>
                                                        <Trophy className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{prize.title}</span>
                                                </div>
                                                <div className="sm:text-right pl-13 sm:pl-0">
                                                    <span className={`text-base font-bold ${colors.valText}`}>
                                                        {prize.reward} <BadgeDollarSign className="text-green-500 " />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-10">
                                {/* Overview */}
                                <section className="space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-orange-500" />
                                        Tổng quan cuộc thi
                                    </h4>
                                    <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-wrap">
                                        {selectedHackathon.description.introduction}
                                    </div>
                                </section>

                                {/* Rounds */}
                                {selectedHackathon.rounds && selectedHackathon.rounds.length > 0 && (
                                    <section className="space-y-4">
                                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                            <Target className="w-5 h-5 text-indigo-500" />
                                            Chi tiết các vòng thi
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedHackathon.rounds.sort((a, b) => a.orderIndex - b.orderIndex).map((round, idx) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                                                        <div>
                                                            <h5 className="font-bold text-lg text-slate-900">{round.roundName}</h5>
                                                            <p className="text-sm text-slate-500 mt-1">{round.description}</p>
                                                        </div>
                                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 w-fit">
                                                            {round.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                                                            Bắt đầu: {new Date(round.startDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                                                            Kết thúc: {new Date(round.endDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-red-500 shrink-0" />
                                                            Hạn nộp: {new Date(round.submissionDeadline).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                                                            Top {round.topN} đi tiếp
                                                        </div>
                                                    </div>
                                                    {round.customCriteriaDetatils && round.customCriteriaDetatils.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                                            <h6 className="font-bold text-slate-800 text-sm mb-2">Tiêu chí đánh giá:</h6>
                                                            <div className="space-y-2">
                                                                {round.customCriteriaDetatils.map((criteria, cIdx) => (
                                                                    <div key={cIdx} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-sm shadow-sm">
                                                                        <div className="flex-1">
                                                                            <span className="font-semibold text-slate-700">{criteria.criteriaName}</span>
                                                                            <p className="text-xs text-slate-500 mt-0.5">{criteria.description}</p>
                                                                        </div>
                                                                        <div className="shrink-0 flex items-center gap-2">
                                                                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">{criteria.type}</span>
                                                                            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-md">Trọng số: {criteria.customWeight}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Rules */}
                                <section className="space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                        <PrinterCheck className="w-5 h-5 text-orange-500" />
                                        Thể lệ cuộc thi
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedHackathon.description.competitionRules.map((be, idx) => (
                                            <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#F26F21] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">{idx + 1}</div>
                                                <span className="text-sm font-medium text-slate-700 pt-0.5">{be}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <section className="space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                        <PrinterCheck className="w-5 h-5 text-orange-500" />
                                        Các giám khảo và mentor
                                    </h4>
                                    <div className="space-y-3">
                                        {experts.map((expert, idx) => (
                                            <div key={idx} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 text-[#F26F21] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">{idx + 1}</div>
                                                <span className="text-sm font-medium text-slate-700 pt-0.5">{expert}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                {/* Benefits */}
                                <section className="space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                        <FlowerIcon className="w-5 h-5 text-orange-500" />
                                        Lợi ích tham gia
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedHackathon.description.participantBenefits.map((be, idx) => (
                                            <div key={idx} className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 flex items-start gap-3 transition-colors hover:bg-emerald-50">
                                                <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-700">{be}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Disqualifications */}
                                <section className="space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-widest flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        Cảnh báo / Loại
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedHackathon.description.disqualificationRules.map((be, idx) => (
                                            <div key={idx} className="bg-red-50/50 border border-red-100/50 rounded-xl p-3 flex items-start gap-3 transition-colors hover:bg-red-50">
                                                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-red-900/80">{be}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Additional Info Notice */}
                        <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="pt-0.5">
                                    <h5 className="text-sm font-bold text-blue-900 mb-1">Lưu ý về đội thi</h5>
                                    <p className="text-sm text-blue-800/80 font-medium">Giới hạn số lượng tham gia: <strong>Tối đa {selectedHackathon.maxTeam} đội</strong>. Vui lòng hoàn tất việc thành lập nhóm và đăng ký sớm.</p>
                                </div>
                            </div>
                        </div>

                        {/* Direct Action */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setSelectedHackathon(null)}
                                className="flex-1 py-4 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold rounded-2xl text-sm sm:text-base cursor-pointer"
                            >
                                Đóng lại
                            </button>
                            {selectedHackathon.status !== "COMPLETED" && selectedHackathon.status !== "REGISTRATION_CLOSED" && (
                                <button
                                    onClick={() => handleOpenRegister(selectedHackathon.eventId.toString())}
                                    className="flex-2 py-4 px-6 text-center bg-linear-to-r from-blue-600 to-orange-600 hover:from-blue-500 hover:to-orange-500 text-white transition-all font-bold rounded-2xl text-sm sm:text-base shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.4)] cursor-pointer hover:-translate-y-1 flex items-center justify-center gap-2 group"
                                >
                                    Đăng ký tham gia ngay
                                    <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}