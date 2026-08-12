import { motion, AnimatePresence } from 'motion/react'
import { useState, useRef } from 'react'
import { Edit, FileCheck2, Send, CloudUpload, FileCode, Trash2, Link2 } from 'lucide-react'
import type { Submission } from '../../../types/team/Submission'
import { submitSubmission } from '../../../services/team/teamsService'
import type { RoundCurrent } from '../../../types/team/TeamStatus'
interface PortalTabProps {
  currentRound: RoundCurrent;
  onSubmit?: (newSubmission: any) => void
  editModeId?: string | null
  initialData?: Submission
  roundDetail?: any
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default function PortalTab({ onSubmit, editModeId, initialData, currentRound, roundDetail }: PortalTabProps) {
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || '')
  const [files, setFiles] = useState<File[]>([])
  const [oldFiles, setOldFiles] = useState<any[]>((initialData as any)?.fileDTOList || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string>('')
  const [githubError, setGithubError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const submissionType = roundDetail?.submissionType || currentRound?.submissionType || 'BOTH';

  const isFormValid = (() => {
    if (submissionType === 'GITHUB_URL') return !!githubUrl;
    if (submissionType === 'FILE') return files.length > 0;
    return !!githubUrl && files.length > 0;
  })();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) handleFiles(Array.from(e.currentTarget.files))
  }

  const handleChangeField = (field: 'githubUrl', value: string) => {
    if (field === 'githubUrl') {
      setGithubUrl(value)
      setGithubError('')
    }
  }

  const maxFileSizeMb = roundDetail?.maxTotalSizeMb || 10;
  const MAX_FILE_SIZE = maxFileSizeMb * 1024 * 1024;

  const allowedExtensions = roundDetail?.allowedFileTypes?.length > 0
    ? roundDetail.allowedFileTypes.map((t: string) => `.${t.toLowerCase()}`)
    : ['.zip', '.rar', '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.mp4'];
  const acceptString = allowedExtensions.join(',');
  const extensionDisplay = allowedExtensions.join(', ');

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    newFiles.forEach(file => {
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExt)) {
        invalidFiles.push(`- ${file.name} (Sai định dạng)`);
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`- ${file.name} (Vượt quá ${maxFileSizeMb}MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setUploadError(`Không thể tải lên các tệp sau:\n${invalidFiles.join('\n')}\n\nVui lòng chỉ nộp file có đuôi: ${extensionDisplay}`);
    } else {
      setUploadError('');
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveOldAttachment = (index: number) => {
    setOldFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await submitSubmission(currentRound.roundId, githubUrl, files);
      if (onSubmit) onSubmit(res);
      if (!editModeId) {
        setGithubUrl('')
        setFiles([])
      }
      window.location.reload();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Đã có lỗi xảy ra';
      if (errMsg.toLowerCase().includes('github') || errMsg.toLowerCase().includes('url')) {
        setGithubError(errMsg);
        setUploadError('');
      } else {
        setUploadError(errMsg);
        setGithubError('');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy chỉnh sửa?')) {
      setGithubUrl('')
      setFiles([])
    }
  }

  const renderSubmitActions = () => (
    <div className="pt-3 mt-4 border-t border-brand-outline-variant/20 flex justify-end gap-2.5">
      {editModeId && (
        <button
          type="button"
          onClick={handleCancelEdit}
          className="bg-white hover:bg-brand-surface text-brand-on-surface font-semibold text-xs px-5 py-2.5 rounded-xl transition-all border border-brand-outline-variant/40 cursor-pointer active:scale-[0.98] shadow-xs"
        >
          Hủy bỏ
        </button>
      )}
      <motion.button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        whileTap={isFormValid && !isSubmitting ? { scale: 0.97 } : {}}
        className={`bg-linear-to-br from-orange-500 to-pink-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-sm ${!isFormValid || isSubmitting
          ? 'opacity-45 cursor-not-allowed saturate-50'
          : 'hover:shadow-md hover:brightness-105 active:scale-[0.98] cursor-pointer'
          }`}
      >
        <Send className="w-3.5 h-3.5" />
        {isSubmitting ? 'Đang nộp...' : (editModeId ? 'Lưu thay đổi' : 'Xác nhận nộp bài')}
      </motion.button>
    </div>
  );

  return (
    <motion.form
      onSubmit={handleProjectSubmit}
      key="portal"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <AnimatePresence>
        {editModeId && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mb-5 p-4 bg-linear-to-r from-orange-50 to-blue-50 border border-brand-primary/25 rounded-2xl flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Edit className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-900">Chế độ cập nhật phiên bản</p>
                <p className="text-[11px] text-[#F26F21]/70 mt-0.5">
                  Đang tạo bản cập nhật từ bài nộp #{editModeId} — bản cũ vẫn sẽ được lưu trữ trong lịch sử.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelEdit}
              className="text-xs font-semibold text-brand-error/80 hover:text-brand-error hover:underline cursor-pointer shrink-0 transition-colors"
            >
              Hủy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {submissionType !== 'FILE' && (
          <div className={`flex flex-col gap-6 ${submissionType === 'GITHUB_URL' ? 'lg:col-span-12' : 'lg:col-span-7'}`}>
          <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 md:p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4 text-brand-primary" />
              </div>
              <h2 className="text-base font-bold text-brand-on-surface">Thông tin bài làm dự án</h2>
            </div>
            <p className="text-xs text-brand-on-surface-variant mb-6 ml-10">
              {submissionType === 'GITHUB_URL'
                ? 'Cung cấp đường dẫn GitHub trước khi nộp.'
                : submissionType === 'FILE'
                  ? 'Xác nhận thông tin và nộp các tệp tin đính kèm ở bên cạnh.'
                  : 'Cung cấp đường dẫn GitHub và tệp tin trước khi nộp.'}
            </p>

            <div className="space-y-5 flex-1 flex flex-col">
              {/* GitHub URL */}
              {submissionType !== 'FILE' && (
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1.5 ml-1">
                    Đường dẫn kho mã nguồn GitHub
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Link2 className="w-4 h-4 text-brand-on-surface-variant/50" />
                    </div>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={e => handleChangeField('githubUrl', e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full bg-white border border-brand-outline-variant/60 rounded-xl pl-9 pr-4 py-3 text-xs focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 transition-all"
                    />
                  </div>
                  <AnimatePresence>
                    {githubError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
                      >
                        <p className="text-[10px] text-red-700 whitespace-pre-line font-mono">{githubError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {submissionType === 'FILE' && <div className="flex-1"></div>}
              {renderSubmitActions()}
            </div>
          </div>
        </div>
        )}

        {/* RIGHT: File upload */}
        {submissionType !== 'GITHUB_URL' && (
          <div className={`flex flex-col gap-5 ${submissionType === 'FILE' ? 'lg:col-span-12' : 'lg:col-span-5'}`}>

            <div className="bg-white rounded-3xl border border-brand-outline-variant/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-brand-on-surface mb-0.5">Tệp tin nộp bài</h3>
              <p className="text-xs text-brand-on-surface-variant mb-4 leading-normal">
                Slide, mã nguồn, tài liệu kiến trúc
              </p>

              {/* Drop zone */}
              <motion.div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                animate={{
                  borderColor: dragActive ? 'var(--color-brand-secondary)' : 'var(--color-brand-outline-variant)',
                  backgroundColor: dragActive ? 'rgba(99,102,241,0.04)' : 'transparent',
                  scale: dragActive ? 1.015 : 1,
                }}
                transition={{ duration: 0.15 }}
                className="border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-brand-surface/40 transition-colors"
              >
                <input ref={fileInputRef} type="file" multiple accept={acceptString} onChange={handleFileSelect} className="hidden" />
                <motion.div
                  animate={{ scale: dragActive ? 1.1 : 1 }}
                  transition={{ duration: 0.15 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragActive ? 'bg-brand-secondary/15 text-brand-secondary' : 'bg-brand-surface-high/80 text-brand-on-surface-variant/70'
                    }`}
                >
                  <CloudUpload className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="text-xs font-semibold text-brand-on-surface">
                    {dragActive ? 'Thả tệp vào đây...' : 'Kéo thả hoặc click để tải lên'}
                  </p>
                  <p className="text-[10px] font-medium text-brand-on-surface-variant/80 mt-1.5">
                    Định dạng cho phép: {extensionDisplay}
                  </p>
                  <p className="text-[9.5px] text-brand-on-surface-variant/50 mt-0.5">
                    (Dung lượng tối đa {maxFileSizeMb}MB / tệp)
                  </p>
                </div>
              </motion.div>

              {/* Upload error */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl overflow-hidden"
                  >
                    <p className="text-[10px] text-red-700 whitespace-pre-line font-mono">{uploadError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File list */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-1.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-on-surface-variant/70">
                        Đã tải lên
                      </p>
                      <span className="text-[10px] font-bold bg-brand-surface-high text-brand-on-surface-variant px-2 py-0.5 rounded-full">
                        {files.length}
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                      {files.map((file, i) => (
                        <motion.div
                          key={`${file.name}-${i}`}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, height: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.18 }}
                          className="flex items-center justify-between p-2.5 bg-brand-surface hover:bg-brand-surface-high/60 border border-brand-outline-variant/30 rounded-xl group transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-brand-secondary/10 flex items-center justify-center shrink-0">
                              <FileCode className="w-3.5 h-3.5 text-brand-secondary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-brand-on-surface truncate">{file.name}</p>
                              <p className="text-[9px] text-brand-on-surface-variant/60 font-mono">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.88 }}
                            onClick={() => handleRemoveAttachment(i)}
                            className="text-brand-on-surface-variant/40 hover:text-brand-error p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Previous version snapshot (edit mode only) */}
            <AnimatePresence>
              {editModeId && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-brand-outline-variant/50 p-5 shadow-xs"
                >
                  <h3 className="text-xs font-bold text-brand-on-surface-variant uppercase tracking-wider mb-3">
                    Bài nộp trước khi chỉnh sửa
                  </h3>
                  <div className="p-3.5 border border-brand-outline-variant/25 rounded-2xl bg-brand-surface/60 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`shrink-0 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${initialData.status === 'SUBMITTED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {initialData.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link2 className="w-3 h-3 text-brand-on-surface-variant/50" />
                        <p className="text-[10px] text-brand-on-surface-variant/60 truncate">{(initialData as any).githubUrl || '—'}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-brand-on-surface-variant/50 font-semibold">{oldFiles.length} tệp đính kèm bản cũ</p>
                      </div>

                      {oldFiles.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          {oldFiles.map((file: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white/60 rounded-xl border border-brand-outline-variant/30 hover:bg-white hover:border-brand-primary/40 transition-colors group">
                              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 min-w-0">
                                <FileCode className="w-3.5 h-3.5 text-brand-on-surface-variant/60 group-hover:text-brand-primary transition-colors shrink-0" />
                                <span className="text-[10px] font-semibold text-brand-on-surface-variant/80 group-hover:text-brand-primary transition-colors truncate">{file.fileName}</span>
                              </a>
                              <motion.button
                                type="button"
                                onClick={() => handleRemoveOldAttachment(i)}
                                whileTap={{ scale: 0.88 }}
                                className="text-brand-on-surface-variant/40 hover:text-brand-error p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {submissionType === 'FILE' && renderSubmitActions()}
          </div>
        )}
      </div>
    </motion.form>
  )
}