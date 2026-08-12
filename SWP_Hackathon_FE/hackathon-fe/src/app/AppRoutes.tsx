import { Routes, Route } from 'react-router-dom'
import Login from '../page/auth/LoginPage'
import Register from '../page/auth/RegisterPage'
import LandingPage from '../page/LandingPage'
import TeamLayout from '../component/layout/TeamLayout'
import DashboardPage from '../page/team/DashboardPage'
import SubmissionsView from '../page/team/SubmissionsView'
import AppealsView from '../page/team/AppealsView'
import RankingView from '../page/team/RankingView'
import AuthLayout from '../component/layout/AuthLayout'
import OverviewAdmin from '../page/admin/OverviewAdmin'
import AuditLogsView from '../page/admin/AuditLogsView'
import UsersView from '../page/admin/UsersView'
import AdminLayout from '../component/layout/AdminLayout'
import SystemConfigView from '../page/admin/SystemConfigView'
import SettingTeamPage from '../page/team/SettingTeamPage'
import MentorLayout from '../component/layout/MentorLayout'
import OverviewTab from '../page/mentor/OverviewTab'
import RequestsTab from '../page/mentor/RequestTab'
import VerifyEmailPage from '../page/auth/VerifyEmailPage'
import ForgotPasswordPage from '../page/auth/ForgotPasswordPage'
import ResetPasswordPage from '../page/auth/ResetPasswordPage'
import CompleteRegisterPage from '../page/auth/CompleteRegisterPage'
import OAuth2RedirectHandler from '../page/auth/OAuth2RedirectHandler'
import EventCoordinatorLayout from '../component/layout/EventCoordinatorLayout'
import OverviewPage from '../page/eventCoordinator/OverviewPage'
import TeamsPage from '../page/eventCoordinator/TeamsPage'
import ProcessRequestPage from '../page/eventCoordinator/ProcessRequestPage'
import SettingsPage from '../page/eventCoordinator/SettingsPage'
import SupportPage from '../page/eventCoordinator/SupportPage'
import CreateEventPage from '../page/eventCoordinator/CreateEventPage'
import MyTeamsTab from '../page/mentor/MyTeams'
import ProtectedRoute from '../component/auth/ProtectedRoute'
import UnauthorizedPage from '../page/auth/UnauthorizedPage'
import ProfilePage from '../page/profile/ProfilePage'
import MyEventsPage from '../page/eventCoordinator/MyEventsPage'
import RespondInvitationPage from '../page/team/RespondInvitationPage'
import TrashEventsPage from '../page/eventCoordinator/TrashEventsPage'
import CriteriaPage from '../page/eventCoordinator/CriteriaPage'

import JudgeDashboard from '../page/judge/DashboardPage'
import JudgeSubmissions from '../page/judge/SubmissionsPage'
import JudgeRankings from '../page/judge/RankingsPage'
import JudgeCriteria from '../page/judge/ReviewSubmissionModal'
import JudgeReviewRequests from '../page/judge/ReviewRequestsPage'
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <Login
                        />
                    </AuthLayout>
                }
            />
            <Route
                path="/register"
                element={
                    <AuthLayout>
                        <Register />
                    </AuthLayout>
                }
            />
            <Route
                path="/complete-register"
                element={
                    <AuthLayout>
                        <CompleteRegisterPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/complete-registration"
                element={
                    <AuthLayout>
                        <CompleteRegisterPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/oauth2/redirect"
                element={
                    <OAuth2RedirectHandler />
                }
            />
            <Route
                path="/verify-account"
                element={
                    <VerifyEmailPage />
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <AuthLayout>
                        <ForgotPasswordPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <AuthLayout>
                        <ResetPasswordPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/respond-invitation"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <AuthLayout>
                            <RespondInvitationPage />
                        </AuthLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'EXPERT', 'ADMIN', 'EVENTCOORDINATOR']}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TeamLayout>
                            <DashboardPage />
                        </TeamLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team/submission"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TeamLayout>
                            <SubmissionsView />
                        </TeamLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team/appeal"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TeamLayout>
                            <AppealsView />
                        </TeamLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team/ranking"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TeamLayout>
                            <RankingView />
                        </TeamLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/team/setting"
                element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                        <TeamLayout>
                            <SettingTeamPage />
                        </TeamLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                </ProtectedRoute>
            }>

                <Route
                    index
                    element={<OverviewAdmin />}
                />

                <Route
                    path="users"
                    element={<UsersView />}
                />

                <Route
                    path="logs"
                    element={<AuditLogsView />}
                />

                <Route
                    path="config"
                    element={<SystemConfigView />}
                />

            </Route>
            <Route path="/mentor" element={
                <ProtectedRoute allowedRoles={['EXPERT']}>
                    <MentorLayout />
                </ProtectedRoute>
            }>
                <Route
                    index
                    element={<OverviewTab />}
                />
                <Route
                    path="requests"
                    element={<RequestsTab />}
                />
                <Route
                    path="my-teams"
                    element={<MyTeamsTab />}
                />
            </Route>
            <Route path="/coordinator" element={
                <ProtectedRoute allowedRoles={['EVENTCOORDINATOR']}>
                    <EventCoordinatorLayout />
                </ProtectedRoute>
            }>
                <Route index element={<OverviewPage />} />
                <Route path="teams" element={<TeamsPage />} />
                <Route path="process-requests" element={<ProcessRequestPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="create-event" element={<CreateEventPage />} />
                <Route path="my-events" element={<MyEventsPage />} />
                <Route path="criteria" element={<CriteriaPage />} />
                <Route path="trash" element={<TrashEventsPage />} />
            </Route>

            <Route path="/judge" element={
                <ProtectedRoute allowedRoles={['JUDGE', 'INTERNAL_JUDGE', 'GUEST_JUDGE', 'EXPERT']}>
                    <MentorLayout />
                </ProtectedRoute>
            }>
                <Route index element={<JudgeDashboard />} />
                <Route path="submissions" element={<JudgeSubmissions />} />
                <Route path="rankings" element={<JudgeRankings />} />
                <Route path="criteria" element={<JudgeCriteria />} />
                <Route path="review-requests" element={<JudgeReviewRequests />} />
            </Route>

        </Routes>
    );
}