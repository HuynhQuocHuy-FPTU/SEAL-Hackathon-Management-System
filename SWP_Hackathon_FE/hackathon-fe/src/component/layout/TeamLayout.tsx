import type { ReactNode } from 'react'
import TopNavbar from '../../component/navbar/TopNavbarPage';
import { Briefcase, Users } from 'lucide-react'
import Sidebar from '../team/Sidebar'

type Props = {
    children: ReactNode;
}
export default function TeamLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-brand-background text-brand-on-surface font-sans flex antialiased select-none">
            <Sidebar />
            <div className="flex-1 min-w-0 md:pl-64 flex flex-col min-h-screen">
                <div className="max-w-310 w-full mx-auto relative z-20">
                    <TopNavbar />
                </div>
                <main className="flex-1 max-w-310 w-full mx-auto px-6 md:px-8 py-8 pb-16">
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight text-brand-on-surface font-sans">
                                Không gian làm việc của nhóm
                            </h1>
                            <span className="bg-[#adc6ff]/45 text-brand-primary font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                                <Users className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" />
                            <p className="text-sm text-brand-on-surface-variant/90 leading-relaxed max-w-2xl font-medium">
                                Đây là nơi nhóm bạn cùng cộng tác và theo dõi tiến độ.
                            </p>
                        </div>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}