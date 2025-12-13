import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

// Configuration du localizer avec moment
const localizer = momentLocalizer(moment);

// Configuration française pour moment
moment.locale('fr', {
  months: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  weekdays: [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ],
  weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    instrumentId: string;
    instrumentName: string;
    serialNumber: string;
    site?: string;
    status: 'ON_TIME' | 'OVERDUE_TOLERATED' | 'OVERDUE_CRITICAL' | 'NOT_SET';
    daysUntil: number;
  };
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onNavigate?: (date: Date) => void;
  onViewChange?: (view: string) => void;
  height?: number;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  onEventClick,
  onNavigate,
  onViewChange,
  height = 600
}) => {
  const [view, setView] = useState<any>(Views.MONTH);

  const handleNavigate = (date: Date) => {
    onNavigate?.(date);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
    onViewChange?.(newView);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const status = event.resource?.status;
    switch (status) {
      case 'OVERDUE_CRITICAL':
        return {
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          color: 'white'
        };
      case 'OVERDUE_TOLERATED':
        return {
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          color: 'white'
        };
      case 'ON_TIME':
        return {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#6b7280',
          borderColor: '#4b5563',
          color: 'white'
        };
    }
  };

  const eventPropGetter = (event: CalendarEvent) => ({
    style: getEventStyle(event),
    title: `${event.title} (${event.resource?.daysUntil}j)`
  });

  const CustomToolbar = ({ label, onNavigate }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-2 rounded-lg bg-primary/10 text-primary-600 hover:bg-primary/20 transition-colors"
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height }}
        view={view}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={onEventClick}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: CustomToolbar
        }}
        messages={{
          next: 'Suivant',
          previous: 'Précédent',
          today: 'Aujourd\'hui',
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          noEventsInRange: 'Aucun étalonnage prévu dans cette période'
        }}
        popup
        showMultiDayTimes
        step={30}
        timeslots={2}
      />
    </div>
  );
};

export default Calendar;
