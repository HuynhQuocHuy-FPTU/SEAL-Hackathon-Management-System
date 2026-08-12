import type { Submission } from "../../types/team/Submission";

interface InputFieldSubmissionProps {
    data: Submission;
    label: string;
    field: "description" | "githubUrl",
    onChangeField: (field: "description" | "githubUrl", value: string) => void;
    placeholder: string;
}

export const InputFieldSubmission = ({ data, field, label, onChangeField, placeholder }: InputFieldSubmissionProps) => {
    return (
        <div>
            <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1.5 ml-1" htmlFor="p-title">
                {label}
            </label>
            <input
                id={label}
                type="text"
                value={data[field]}
                onChange={(e) => onChangeField(field, e.target.value)}
                className="w-full bg-white border border-brand-outline-variant/60 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                placeholder={placeholder}
            />
        </div>
    )
}