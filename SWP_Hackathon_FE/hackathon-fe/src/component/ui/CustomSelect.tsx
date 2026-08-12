import Select from 'react-select';
import type { Props as SelectProps } from 'react-select';

export interface OptionType {
  value: string | number;
  label: string;
}

interface CustomSelectProps extends Omit<SelectProps<OptionType, false>, 'value' | 'onChange'> {
  value?: string | number | null | '';
  onChange?: (value: any) => void;
  options: OptionType[];
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'inline';
}

export default function CustomSelect({ value, onChange, options, className, variant = 'default', ...props }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleChange = (selected: any) => {
    if (onChange) {
      onChange(selected ? selected.value : '');
    }
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      className={`react-select-container ${className || ''}`}
      classNamePrefix="react-select"
      menuPortalTarget={document.body}
      styles={{
        menuPortal: base => ({ ...base, zIndex: 50 }),
        control: (base, state) => ({
          ...base,
          minHeight: variant === 'inline' ? '26px' : '28px',
          backgroundColor: variant === 'inline' ? '#ebf2fa' : '#f8fafc',
          borderColor: variant === 'inline' ? 'transparent' : (state.isFocused ? '#3b82f6' : '#e2e8f0'),
          borderRadius: variant === 'inline' ? '0.375rem' : '0.75rem',
          boxShadow: variant === 'inline' ? 'none' : (state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'),
          '&:hover': {
            borderColor: variant === 'inline' ? 'transparent' : (state.isFocused ? '#3b82f6' : '#cbd5e1'),
          },
          cursor: 'pointer',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          zIndex: 50,
          marginTop: '0.5rem',
          minWidth: variant === 'inline' ? '140px' : 'auto',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? '#eff6ff'
            : state.isFocused
              ? '#f1f5f9'
              : 'white',
          color: state.isSelected ? '#4cc9f0' : '#475569',
          fontWeight: state.isSelected ? '700' : '600',
          fontSize: '0.75rem',
          padding: variant === 'inline' ? '8px 12px' : '10px 16px',
          cursor: 'pointer',
          '&:active': {
            backgroundColor: '#dbeafe',
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: variant === 'inline' ? '#3b82f6' : '#334155',
          fontWeight: '700',
          fontSize: '0.75rem',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#94a3b8',
          fontSize: '0.75rem',
          fontWeight: '600',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? '#3b82f6' : '#94a3b8',
          padding: variant === 'inline' ? '2px' : '8px',
          '&:hover': {
            color: '#3b82f6',
          }
        }),
      }}
      {...props}
    />
  );
}
