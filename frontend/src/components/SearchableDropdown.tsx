'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableDropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}

export default function SearchableDropdown({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  error,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync search input with value when not focused / when selection changes
  const displayValue = isOpen ? searchTerm : value;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes((isOpen ? searchTerm : '').toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        onChange(filteredOptions[activeIndex]);
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="flex flex-col gap-1.5 relative w-full" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value;
            if (!isOpen) setIsOpen(true);
            setSearchTerm(val);
            onChange(val);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!error}
          autoComplete="off"
          className={`w-full pl-3 pr-10 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors bg-muted/20 text-foreground cursor-pointer ${
            error
              ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
              : 'border-border focus:ring-primary/50 focus:border-primary'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground gap-1">
          {isOpen && <Search className="w-3.5 h-3.5 opacity-60" />}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
        </div>
      </div>

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}

      {/* Options Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-48 flex flex-col">
          <div ref={listRef} className="overflow-y-auto py-1.5">
            {filteredOptions.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No matches found.</p>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt === value;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors block ${
                      isSelected
                        ? 'bg-primary/20 text-primary font-semibold'
                        : isActive
                        ? 'bg-muted text-foreground'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
