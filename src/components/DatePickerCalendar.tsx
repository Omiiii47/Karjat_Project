'use client';

import React, { useState, useEffect } from 'react';

interface DatePickerCalendarProps {
  villaId: string;
  onDateSelect: (checkIn: string, checkOut: string) => void;
  bookedDates: string[];
}

export default function DatePickerCalendar({ villaId, onDateSelect, bookedDates }: DatePickerCalendarProps) {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  
  // Always start from current month, never past
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  const [selectedDates, setSelectedDates] = useState<{
    checkIn: string | null;
    checkOut: string | null;
  }>({
    checkIn: null,
    checkOut: null
  });
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  // Remove viewMode - always show single month
  // const [viewMode, setViewMode] = useState<'single' | 'double'>('double');

  // Ensure calendar never shows past months
  useEffect(() => {
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentMonth < currentMonthStart) {
      setCurrentMonth(currentMonthStart);
    }
  }, [currentMonth, today]);

  // Generate single month for better UX
  const getMonthsToShow = () => {
    return [currentMonth]; // Always show just current month
  };

  // Get all dates in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      dayDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      days.push(dayDate);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    // Use local timezone to avoid date shifting issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateBooked = (date: Date) => {
    const dateString = formatDate(date);
    return bookedDates.includes(dateString);
  };

  const isDateSelected = (date: Date) => {
    const dateString = formatDate(date);
    return dateString === selectedDates.checkIn || dateString === selectedDates.checkOut;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    const dateString = formatDate(date);
    return dateString > selectedDates.checkIn && dateString < selectedDates.checkOut;
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date) || isDateBooked(date)) return;

    const dateString = formatDate(date);

    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      // Start new selection
      setSelectedDates({ checkIn: dateString, checkOut: null });
      setIsSelectingCheckOut(true);
    } else if (selectedDates.checkIn && !selectedDates.checkOut) {
      // Complete selection
      if (dateString > selectedDates.checkIn) {
        setSelectedDates({ ...selectedDates, checkOut: dateString });
        setIsSelectingCheckOut(false);
        onDateSelect(selectedDates.checkIn, dateString);
      } else {
        // Reset if selected date is before check-in
        setSelectedDates({ checkIn: dateString, checkOut: null });
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
        // Don't go before current month
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (newMonth < currentMonthStart) {
          return prev; // Don't change if it would go to past
        }
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
        // Allow up to 12 months in advance
        const maxFutureDate = new Date(today.getFullYear() + 1, today.getMonth(), 1);
        if (newMonth > maxFutureDate) {
          return prev; // Don't go beyond 1 year
        }
      }
      return newMonth;
    });
  };

  const canNavigatePrev = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return prevMonth >= currentMonthStart;
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1); // Always just 1 month ahead
    const maxFutureDate = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    return nextMonth <= maxFutureDate;
  };

  const getDateClassName = (date: Date) => {
    let baseClass = "w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors";
    
    if (isDatePast(date)) {
      return `${baseClass} text-gray-300 cursor-not-allowed`;
    }
    
    if (isDateBooked(date)) {
      return `${baseClass} bg-red-100 text-red-800 cursor-not-allowed border-2 border-red-300`;
    }
    
    if (isDateSelected(date)) {
      return `${baseClass} bg-green-500 text-white font-bold`;
    }
    
    if (isDateInRange(date)) {
      return `${baseClass} bg-green-100 text-green-800`;
    }
    
    return `${baseClass} hover:bg-blue-100 text-gray-700`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          disabled={!canNavigatePrev()}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Month Display */}
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          disabled={!canNavigateNext()}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Single Month Display */}
      <div>
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <div
                  className={getDateClassName(date)}
                  onClick={() => handleDateClick(date)}
                >
                  {date.getDate()}
                </div>
              ) : (
                <div className="w-10 h-10"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-gray-600">Selected Range</span>
        </div>
      </div>

      {/* Selection Status */}
      {selectedDates.checkIn && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {!selectedDates.checkOut ? (
              <>
                <strong>Check-in Date:</strong> {new Date(selectedDates.checkIn).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} 
                <br />
                <span className="text-blue-600">Now click to select your check-out date</span>
              </>
            ) : (
              <>
                <strong>Check-in Date:</strong> {new Date(selectedDates.checkIn).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} 
                <br />
                <strong>Check-out Date:</strong> {new Date(selectedDates.checkOut).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
