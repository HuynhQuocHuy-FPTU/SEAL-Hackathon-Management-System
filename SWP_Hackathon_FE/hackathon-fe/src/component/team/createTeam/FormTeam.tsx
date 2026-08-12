import { motion, AnimatePresence } from "motion/react";
import { Mail, Plus, X, Info, Rocket, CheckCircle, ShieldAlert } from "lucide-react";
import React, { useState } from "react";
import type { TeamCreate } from '../../../types/team/TeamCreate';
import { createTeam } from '../../../services/team/teamsService';
import { useAuthContext } from "../../../hook/useAuthContext";
import { useNavigate } from "react-router-dom";


export default function FormTeam() {
  const navigate = useNavigate();
  // Team Form Fields
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<TeamCreate>({
    teamName: "",
    memberEmails: [],
  });

  // UI states
  const [newEmail, setNewEmail] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Status & Validation states
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = () => {
    if (!newEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setFieldErrors(prev => ({ ...prev, member: "Định dạng email không hợp lệ" }));
      return;
    }
    if (user?.email && newEmail.toLowerCase() === user.email.toLowerCase()) {
      setFieldErrors(prev => ({ ...prev, member: "Bạn đã là trưởng nhóm!" }));
      return;
    }
    if (formData.memberEmails.includes(newEmail)) {
      setFieldErrors(prev => ({ ...prev, member: "Email đã được thêm" }));
      return;
    }

    setFieldErrors(prev => ({ ...prev, member: "" }));
    setFormData(prev => ({
      ...prev,
      memberEmails: [...prev.memberEmails, newEmail.trim()],
    }));
    setNewEmail("");
  };

  const handleRemoveMember = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.filter(email => email !== emailToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formData.teamName.trim()) {
      errors.name = "Tên nhóm là bắt buộc.";
    }
    const totalSquadCount = 1 + formData.memberEmails.length;
    if (totalSquadCount < 2 || totalSquadCount > 5) {
      errors.squad = `Nhóm của bạn có ${totalSquadCount} thành viên. Quy định tiêu chuẩn yêu cầu nhóm từ 2 - 5 thành viên.`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      await createTeam(formData);

      setIsSubmitted(true);
    } catch (error: any) {
      setFieldErrors(prev => ({
        ...prev,
        member: error.response?.data?.message || "Tạo nhóm thất bại."
      }));
      window.scrollTo({ top: 120, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      teamName: "",
      memberEmails: ["alex@example.com"],
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-3xl border border-outline-variant/60 p-8 md:p-12 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Confetti decoration circles */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 text-primary rounded-full mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl md:text-3xl font-black text-on-surface tracking-tight">
              Tạo nhóm thành công!
            </h1>
            <p className="font-sans text-[#424754] text-sm max-w-md mx-auto">
              Không gian làm việc đang được chuẩn bị. Lời mời đã được gửi đến các thành viên nhóm.
            </p>
          </div>

          {/* Recapitulation of Team details */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3">
            <div>
              <span className="block text-[10px] font-bold font-label text-outline uppercase tracking-wider">
                Tên nhóm
              </span>
              <span className="font-sans font-bold text-on-surface text-base">
                🚀 {formData.teamName}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold font-label text-outline uppercase tracking-wider mb-1.5">
                Danh sách thành viên ({1 + formData.memberEmails.length} đã xác minh)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-sans font-semibold">
                  TÔI: {user?.email} (Trưởng nhóm)
                </span>
                {formData.memberEmails.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] bg-surface-container-lowest border border-outline-variant/50 px-2 py-0.5 rounded-full font-sans font-medium text-on-surface-variant"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">Trạng thái:</span>
              <span className={`font-bold uppercase ${isPublic ? "text-primary" : "text-outline"}`}>
                {isPublic ? "🌐 Công khai" : "🔒 Đã ẩn"}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/team')}
              className="px-6 py-3 bg-primary text-white font-semibold font-label rounded-xl hover:bg-primary-container hover:shadow-md transition-all text-sm cursor-pointer"
            >
              Vào bảng điều khiển
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-outline-variant text-[#191c1d] hover:bg-surface-container-low font-semibold font-label rounded-xl transition-all text-sm cursor-pointer"
            >
              Tạo nhóm mới
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white rounded-3xl border border-outline-variant/50 p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-on-surface mb-1 tracking-tight">
          Tạo nhóm mới
        </h1>
        <p className="font-sans text-sm text-[#424754]">
          Khởi tạo không gian làm việc và mời các thành viên tham gia.
        </p>
      </div>

      {Object.values(fieldErrors).some(msg => msg !== "") && (
        <div className="mb-6 bg-error-container border border-error/20 p-4 rounded-2xl text-xs md:text-sm text-on-error-container font-sans space-y-1">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-error" /> Lỗi xác thực
          </div>
          {Object.entries(fieldErrors)
            .filter(([_, msg]) => msg !== "")
            .map(([key, msg]) => (
              <p key={key} className="pl-5 ">
                <span className="font-bold capitalize">{key}:</span> {msg}
              </p>
            ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Details */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="team-name">
              Tên nhóm
            </label>
            <input
              className={`w-full bg-[#f8f9fa] border text-on-surface font-sans text-sm md:text-base rounded-xl px-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all ${fieldErrors.name ? "border-error ring-1 ring-error/20" : "border-outline-variant"
                }`}
              id="team-name"
              placeholder="VD: Quantum Coders"
              type="text"
              value={formData.teamName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, teamName: e.target.value }));
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
              }}
            />
          </div>
        </div>

        <hr className="border-outline-variant/30" />

        {/* Section 2: Team Roster */}
        <div className="bg-surface-container-low rounded-2xl p-5 md:p-6 border border-outline-variant/20">
          <div className="mb-4">
            <h3 className="font-sans font-bold text-base md:text-lg text-on-surface">
              Mời thành viên
            </h3>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative grow">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                className={`w-full bg-[#ffffff] border text-on-surface font-sans text-sm rounded-xl pl-10 pr-4 py-3 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all ${fieldErrors.member ? "border-error ring-1 ring-error/10" : "border-outline-variant"
                  }`}
                placeholder="colleague@domain.com"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (fieldErrors.member) setFieldErrors((p) => ({ ...p, member: "" }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
              />
            </div>
            <button
              className="bg-white border border-outline-variant text-[#191c1d] font-semibold font-label text-xs md:text-sm px-5 py-3 rounded-xl hover:bg-surface-container transition-all flex items-center gap-1 cursor-pointer"
              type="button"
              onClick={handleAddMember}
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>

          {fieldErrors.member && (
            <p className="text-xs text-error font-medium mb-3 pl-1">
              ⚠️ {fieldErrors.member}
            </p>
          )}

          {/* Roster Tags List */}
          <div className="flex flex-wrap gap-2">
            {/* Owner Tag Card */}
            <div className="flex items-center gap-1.5 bg-white border border-outline-variant/50 rounded-full pl-1 pr-3 py-1 shadow-sm select-none">
              <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label text-[10px] font-bold">
                ME
              </div>
              <span className="font-sans text-xs text-on-surface font-medium">
                {user?.email}
              </span>
              <span className="font-label text-[10px] font-semibold text-outline ml-0.5">
                (Trưởng nhóm)
              </span>
            </div>

            {/* Teammates Tags */}
            <AnimatePresence>
              {formData.memberEmails.map((memberEmail) => (
                <motion.div
                  key={memberEmail}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 bg-white border border-outline-variant/50 rounded-full pl-3 pr-1 py-1 shadow-sm"
                >
                  <span className="font-sans text-xs text-on-surface font-medium">
                    {memberEmail}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(memberEmail)}
                    className="w-5.5 h-5.5 rounded-full hover:bg-error-container text-[#424754] hover:text-error flex items-center justify-center transition-all cursor-pointer"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <hr className="border-outline-variant/30" />
        {/* Submit Action */}
        <div className="pt-2">
          {/* {!userEmail && (
            <p className="text-center text-xs text-on-surface-variant font-sans mb-3 bg-[#f8f9fa] border border-outline-variant/30 p-2 rounded-xl">
              💡 You are posting guest-identity context. Consider{" "}
              <button
                type="button"
                className="text-primary font-bold hover:underline"
                onClick={() => openAuth("login")}
              >
                logging in
              </button>{" "}
              to auto-associate user credentials!
            </p>
          )} */}

          <button
            className="w-full bg-primary text-white font-label font-bold text-sm md:text-base py-4 rounded-xl hover:bg-primary-container hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            id="btn-initialize-team"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Đang khởi tạo...
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full ml-1"
                />
              </>
            ) : (
              <>
                Khởi tạo nhóm <Rocket className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
