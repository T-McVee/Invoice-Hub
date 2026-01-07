'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerProps {
  value: string; // YYYY-MM format
  onChange: (month: string) => void;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function MonthPicker({ value, onChange, disabled }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number);

  const handlePrevMonth = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    onChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    const newValue = `${newYear}-${String(newMonth).padStart(2, '0')}`;

    // Don't allow future months
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (newValue <= currentMonth) {
      onChange(newValue);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    onChange(`${newYear}-${String(month).padStart(2, '0')}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    onChange(`${year}-${String(newMonth).padStart(2, '0')}`);
  };

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Check if next month is allowed
  const now = new Date();
  const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isNextDisabled = value >= currentMonthValue;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Month
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={disabled}
          className="p-2 rounded-lg border border-input bg-background hover:bg-accent 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex gap-2 flex-1">
          <select
            value={month}
            onChange={handleMonthChange}
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background 
                       text-foreground font-medium focus:outline-none focus:ring-2 
                       focus:ring-ring disabled:opacity-50"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={handleYearChange}
            disabled={disabled}
            className="w-24 px-3 py-2 rounded-lg border border-input bg-background 
                       text-foreground font-medium focus:outline-none focus:ring-2 
                       focus:ring-ring disabled:opacity-50"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={disabled || isNextDisabled}
          className="p-2 rounded-lg border border-input bg-background hover:bg-accent 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
