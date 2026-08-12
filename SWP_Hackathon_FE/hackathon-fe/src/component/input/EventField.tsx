import React from 'react';
import type { UseFormRegister } from "react-hook-form";
import CustomSelect from '../ui/CustomSelect';

interface EventFieldProps {
    Icon?: React.ElementType;
    label: string;
    field?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    register?: UseFormRegister<any>;
    error?: string;
}

interface EventSelectFieldProps extends EventFieldProps {
    options: { value: string | number; label: string }[];
}


export const EventField = ({ Icon, label, field, value, onChange, placeholder, register, error }: EventFieldProps) => {
    const inputProps = register && field ? register(field) : {
        value: value || "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(e)
    };

    return (
        <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider flex items-center gap-1">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />} {label}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                {...inputProps}
                className={`w-full bg-slate-50/50 hover:bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'} rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all`}
            />
            {error && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{error}</p>}
        </div>
    )
}

export const EventDateField = ({ Icon, label, field, value, onChange, register, error }: EventFieldProps) => {
    const inputProps = register && field ? register(field) : {
        value: value || "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(e)
    };

    return (
        <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider flex items-center gap-1">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />} {label}
            </label>
            <input
                type="datetime-local"
                {...inputProps}
                className={`w-full bg-slate-50/50 hover:bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'} rounded-xl px-4 py-3 text-xs text-slate-500 focus:outline-none focus:ring-2 focus:bg-white transition-all`}
            />
            {error && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{error}</p>}
        </div>
    )
}

export const EventTeamField = ({ label, field, value, onChange, placeholder, register, error }: EventFieldProps) => {
    const inputProps = register && field ? register(field, { valueAsNumber: true }) : {
        value: value || "",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange && onChange(e)
    };

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                {label}
            </label>
            <input
                type="number"
                placeholder={placeholder}
                {...inputProps}
                className={`w-full bg-slate-50/50 hover:bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'} rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all`}
            />
            {error && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{error}</p>}
        </div>
    );
}

export const EventSelectField = ({ Icon, label, field, value, onChange, placeholder, error, options }: EventSelectFieldProps) => {
    const handleChange = (val: any) => {
        if (onChange) {
            onChange({ target: { name: field, value: val } } as any);
        }
    };

    return (
        <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider flex items-center gap-1">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />} {label}
            </label>
            <div className={error ? "rounded-xl border border-red-500" : ""}>
                <CustomSelect
                    value={value as any}
                    onChange={handleChange}
                    options={options}
                    placeholder={placeholder}
                />
            </div>
            {error && <p className="text-red-500 text-xs ml-1 mt-1 animate-fade-in">{error}</p>}
        </div>
    )
}
