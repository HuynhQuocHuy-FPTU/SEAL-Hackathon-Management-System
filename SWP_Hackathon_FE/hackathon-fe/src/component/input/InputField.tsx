import type { UseFormRegister } from "react-hook-form";

interface InputFieldProps<T extends Record<string, any>> {
    label: string;
    field: string;
    placeholder: string;
    // For controlled inputs
    formData?: T;
    onChangeField?: (field: keyof T, value: string) => void;
    // For react-hook-form
    register?: UseFormRegister<any>;
    error?: string;
    type?: string;
}

export function InputField<T extends Record<string, any>>({ label, formData, field, placeholder, onChangeField, register, error, type }: InputFieldProps<T>) {
    const inputType = type || (label === "Password" || label === "Mật khẩu" ? "password" : "text");
    
    const inputProps = register ? register(field) : {
        value: formData ? formData[field] || "" : "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeField && onChangeField(field as keyof T, e.target.value.trimStart())
    };

    return (
        <div className="styled-group space-y-1.5 w-full">
            <label className="text-xs font-semibold text-on-surface-variant ml-1" htmlFor={field}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={label}
                    type={inputType}
                    placeholder={placeholder}
                    {...inputProps}
                    className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'} rounded-xl focus:ring-2 outline-none transition-all text-sm text-on-surface placeholder:text-outline/50`}
                />
            </div>
            {error && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{error}</p>}
        </div>
    )
}

interface UniversitySelectionProps {
    value: string;
    checked: boolean;
    onSelect: () => void;
}

export const UniversitySelection = ({ value, checked, onSelect }: UniversitySelectionProps) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
                type="radio"
                name="university"
                checked={checked}
                onChange={onSelect}
                className="w-4.5 h-4.5 text-primary border-outline focus:ring-primary cursor-pointer"
            />
            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                {value}
            </span>
        </label>
    )
}