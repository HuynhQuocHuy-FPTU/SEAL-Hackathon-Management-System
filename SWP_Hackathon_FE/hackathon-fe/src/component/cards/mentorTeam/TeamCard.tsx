import {
    Flag,
    FileText,
    CheckCircle2,
    TriangleAlert,
    Sparkles,
    Clock
} from 'lucide-react';
import type { Team, StatusTag } from '../../../types';
interface TeamCardProps {
    team: Team;
    onOpenDetails: (team: Team) => void;
}

export default function TeamCard({ team, onOpenDetails }: TeamCardProps) {
    // Category styling matching the material spec
    const getCategoryStyles = (cat: StatusTag) => {
        switch (cat) {
            case 'AI':
                return {
                    bg: 'bg-blue-100/70 border-blue-200/50',
                    text: 'text-blue-700',
                    label: 'AI'
                };
            case 'Web3':
                return {
                    bg: 'bg-orange-100/70 border-orange-200/50',
                    text: 'text-[#F26F21]',
                    label: 'Web3'
                };
            case 'Sustainability':
                return {
                    bg: 'bg-teal-100/70 border-teal-200/50',
                    text: 'text-teal-700',
                    label: 'Sustainability'
                };
            case 'Healthtech':
                return {
                    bg: 'bg-cyan-100/70 border-cyan-200/50',
                    text: 'text-cyan-700',
                    label: 'Healthtech'
                };
            default:
                return {
                    bg: 'bg-slate-100 border-slate-200',
                    text: 'text-slate-700',
                    label: cat
                };
        }
    };

    // Status Badge styles
    const getHelpBadge = (status: typeof team.helpStatus) => {
        switch (status) {
            case 'Needs Help':
                return (
                    <span className="bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <TriangleAlert className="w-3.5 h-3.5 fill-red-500 text-red-50" />
                        Needs Help
                    </span>
                );
            case 'Recent Update':
                return (
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Recent Update
                    </span>
                );
            case 'Resolved':
                return (
                    <span className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Resolved
                    </span>
                );
            default:
                return null; // Nominal tags display normal layout
        }
    };

    const getProgressStyles = (cat: StatusTag) => {
        switch (cat) {
            case 'AI':
                return 'bg-[#F26F21]';
            case 'Web3':
                return 'bg-[#F26F21]';
            case 'Sustainability':
                return 'bg-teal-600';
            case 'Healthtech':
                return 'bg-red-500'; 
            default:
                return 'bg-slate-600';
        }
    };

    const catStyles = getCategoryStyles(team.category);

    // Find next milestone to show inside the target panel
    const nextMilestone = team.milestones.find(m => !m.completed) || team.milestones[team.milestones.length - 1];

    const getMilestoneIcon = (mStatus: string, cat: StatusTag) => {
        if (mStatus === 'Completed') {
            return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
        }
        if (cat === 'Sustainability') {
            return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
        }
        if (cat === 'AI') {
            return <Flag className="w-4 h-4 text-blue-600" />;
        }
        if (cat === 'Web3') {
            return <FileText className="w-4 h-4 text-[#F26F21]" />;
        }
        return <Clock className="w-4 h-4 text-red-500" />;
    };

    const getMilestoneTimeColor = (mStatus: string) => {
        if (mStatus === 'Completed') return 'text-teal-600 font-semibold';
        if (mStatus === 'Overdue') return 'text-red-500 font-bold';
        if (mStatus === 'Tomorrow') return 'text-slate-600 font-medium';
        return 'text-slate-600 font-medium';
    };

    return (
        <div
            className="bg-white border border-slate-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-100 rounded-3xl p-6 transition-all duration-300 flex flex-col group h-full"
        >
            {/* Header Info */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-sans text-lg font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                            {team.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catStyles.bg} ${catStyles.text}`}>
                            {catStyles.label}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal">
                        {team.description}
                    </p>
                </div>
                {getHelpBadge(team.helpStatus)}
            </div>

            {/* Team Avatars with multi overlap */}
            <div className="flex -space-x-3.5 mb-6 pt-1">
                {team.members.slice(0, 3).map((member, idx) => (
                    <img
                        key={idx}
                        src={member.avatar}
                        alt={member.name}
                        title={`${member.name} • ${member.role}`}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-slate-100"
                    />
                ))}
                {team.members.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-extrabold text-slate-500 shadow-sm">
                        +{team.members.length - 3}
                    </div>
                )}
            </div>

            {/* Progress Bars Container */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium font-mono">Progress</span>
                    <span className="text-slate-800 font-bold font-mono">{team.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${getProgressStyles(team.category)}`}
                        style={{ width: `${team.progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Milestone Card Widget */}
            {nextMilestone && (
                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-3 rounded-2xl mb-6 mt-auto">
                    <div className="p-1.5 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        {getMilestoneIcon(nextMilestone.completed ? 'Completed' : 'Pending', team.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                            Next Milestone
                        </p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {nextMilestone.title}
                        </p>
                    </div>
                    <span className={`text-xs select-none pr-1 truncate ${getMilestoneTimeColor(nextMilestone.completed ? 'Completed' : 'Pending')}`}>
                        {nextMilestone.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
            )}

            {/* Floating CTA Button */}
            <button
                type="button"
                onClick={() => onOpenDetails(team)}
                className="w-full py-3 bg-slate-100 group-hover:bg-[#F26F21] text-slate-700 group-hover:text-white font-semibold rounded-2xl text-xs transition-all duration-300 cursor-pointer active:scale-98 shadow-sm flex items-center justify-center gap-1.5"
            >
                <span>View Team Details</span>
            </button>
        </div>
    );
}
