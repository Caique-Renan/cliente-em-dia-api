import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface AsyncSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  data?: any;
}

interface AsyncSearchSelectProps {
  value: string;
  onChange: (value: string, option?: AsyncSelectOption | null) => void;
  loadOptions: (inputValue: string) => Promise<AsyncSelectOption[]>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  initialLabel?: string;
  loadOnFocus?: boolean;
  minSearchLength?: number;
  emptySearchLabel?: string;
  initialOptionsLabel?: string;
}

export const AsyncSearchSelect: React.FC<AsyncSearchSelectProps> = ({
  value,
  onChange,
  loadOptions,
  placeholder = 'Buscar...',
  disabled = false,
  error,
  initialLabel = '',
  loadOnFocus = false,
  minSearchLength = 2,
  emptySearchLabel = 'Digite para buscar...',
  initialOptionsLabel = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLabel, setDisplayLabel] = useState(initialLabel);
  const [options, setOptions] = useState<AsyncSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Track requests to avoid race conditions
  const requestRef = useRef<number>(0);

  useEffect(() => {
    setDisplayLabel(initialLabel);
  }, [initialLabel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const isInitialLoad = loadOnFocus && searchTerm.length === 0;

    if (searchTerm.length < minSearchLength && !isInitialLoad) {
      setOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      const currentRequestId = ++requestRef.current;

      try {
        const results = await loadOptions(searchTerm);
        if (currentRequestId === requestRef.current) {
          setOptions(results);
        }
      } catch (error) {
        console.error('Error fetching options', error);
        if (currentRequestId === requestRef.current) {
          setOptions([]);
        }
      } finally {
        if (currentRequestId === requestRef.current) {
          setIsLoading(false);
        }
      }
    }, isInitialLoad ? 0 : 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadOptions, isOpen, loadOnFocus, minSearchLength]);

  const handleSelect = (option: AsyncSelectOption) => {
    setDisplayLabel(option.label);
    setSearchTerm('');
    setIsOpen(false);
    onChange(option.value, option);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayLabel('');
    setSearchTerm('');
    setOptions([]);
    onChange('', null);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className={`w-full flex items-center justify-between px-4 py-2 border rounded-md transition-all min-h-[42px]
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'bg-[var(--color-surface)] cursor-pointer'}
          ${error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}
          ${isOpen ? 'ring-2 ring-[var(--color-accent)] border-transparent' : ''}
        `}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2">
          {isOpen ? (
            <input
              type="text"
              className="w-full bg-transparent outline-none text-[var(--color-text-primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchTerm.length === 0 ? emptySearchLabel : "Digite para buscar..."}
              autoFocus
            />
          ) : (
            <span className={value && displayLabel ? 'text-[var(--color-text-primary)]' : 'text-gray-400'}>
              {value && displayLabel ? displayLabel : placeholder}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          
          {value && !disabled && !isOpen && (
            <button 
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-[var(--color-danger)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {!value && !isOpen && <Search className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {error && <p className="text-[var(--color-danger)] text-xs mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchTerm.length < minSearchLength && !(loadOnFocus && searchTerm.length === 0) ? (
            <div className="p-3 text-sm text-center text-[var(--color-text-secondary)]">
              {`Digite pelo menos ${minSearchLength} caracteres`}
            </div>
          ) : isLoading && options.length === 0 ? (
            <div className="p-3 text-sm text-center text-[var(--color-text-secondary)]">
              Buscando...
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-center text-[var(--color-text-secondary)]">
              Nenhum resultado encontrado
            </div>
          ) : (
            <ul className="py-1">
              {searchTerm.length === 0 && loadOnFocus && options.length > 0 && initialOptionsLabel && (
                <li className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider bg-gray-50 border-b border-[var(--color-border)]">
                  {initialOptionsLabel}
                </li>
              )}
              {options.map((option) => (
                <li 
                  key={option.value}
                  className="px-4 py-2 hover:bg-[var(--color-background)] cursor-pointer border-b border-[var(--color-border)] last:border-0"
                  onClick={() => handleSelect(option)}
                >
                  <div className="font-medium text-sm text-[var(--color-text-primary)]">{option.label}</div>
                  {option.subLabel && (
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{option.subLabel}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
