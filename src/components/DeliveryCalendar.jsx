import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DeliveryCalendar = ({ orders, onDateClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const hasDeliveries = orders.some(o => o.deliveryDate === dateStr);

        days.push(
            <div
                key={d}
                className={`calendar-day ${hasDeliveries ? 'has-delivery' : ''}`}
                onClick={() => onDateClick(dateStr)}
            >
                {d}
            </div>
        );
    }

    return (
        <div className="delivery-calendar">
            <div className="calendar-header">
                <button onClick={prevMonth}><ChevronLeft /></button>
                <h3>{monthNames[month]} {year}</h3>
                <button onClick={nextMonth}><ChevronRight /></button>
            </div>
            <div className="calendar-grid">
                <div className="day-name">Sun</div>
                <div className="day-name">Mon</div>
                <div className="day-name">Tue</div>
                <div className="day-name">Wed</div>
                <div className="day-name">Thu</div>
                <div className="day-name">Fri</div>
                <div className="day-name">Sat</div>
                {days}
            </div>
        </div>
    );
};

export default DeliveryCalendar;
