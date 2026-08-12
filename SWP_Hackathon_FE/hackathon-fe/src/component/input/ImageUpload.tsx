import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    value?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, value }) => {
    const [preview, setPreview] = useState<string | null>(value || null);

    // Update preview if value from props changes (e.g. from URL params)
    React.useEffect(() => {
        if (value) {
            setPreview(value);
        }
    }, [value]);

    return (
        <div className="styled-group space-y-1.5 sm:col-span-2 grid grid-cols-1">
            <label className="text-xs font-semibold text-on-surface-variant ml-3">
                {label}
            </label>
            <div className="flex items-center gap-4 mt-2 justify-items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-outline-variant bg-slate-50 flex items-center justify-center">
                    {preview ? (
                        <>
                            <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
                        </>
                    ) : (
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                    )}
                </div>
            </div>
        </div>
    );
};
