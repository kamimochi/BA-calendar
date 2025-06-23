import { useState, useMemo } from 'react';
import { Calendar, type View, type DateLocalizer, type EventPropGetter } from 'react-big-calendar'; 
import { format, parse, startOfWeek, getDay, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { dateFnsLocalizer } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  Container, Button, ButtonGroup, Modal, Typography, Card, CardContent, CardHeader, Box,
  useTheme, useMediaQuery,
} from '@mui/material';

import eventsData from "./data/events.json";

// 型定義
type EventData = { id: number; title: string; start: string; end?: string; category: 'game' | 'goods' | 'event'; description?: string; url?: string; urlText?: string; };
interface MyEvent { id: number; title: string; start: Date; end: Date; category: 'game' | 'goods' | 'event'; description?: string; url?: string; urlText?: string; }
const myEvents: MyEvent[] = (eventsData as EventData[]).map((event) => ({ ...event, start: new Date(event.start), end: new Date(event.end || event.start), category: event.category as 'game' | 'goods' | 'event' }));
const locales = { 'ja': ja, };
const localizer: DateLocalizer = dateFnsLocalizer({ format, parse, startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }), getDay, locales });

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
};

function App() {
  const [calendarType, setCalendarType] = useState<'all' | 'game' | 'goods' | 'event'>('all');
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const theme = useTheme();
  const isPc = useMediaQuery(theme.breakpoints.up('sm'));

  const filteredEvents = useMemo(() => {
    if (calendarType === 'all') {
      return myEvents;
    }
    return myEvents.filter(event => event.category === calendarType);
  }, [calendarType]);

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
  };
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // ★★★ ここからが今回の修正の核心です ★★★
  
  // 1. 日付セル全体のスタイルを制御する
  const dayPropGetter = (date: Date) => {
    const classNames = [];
    if (isSameDay(date, new Date())) {
      classNames.push('my-today');
    }
    
    // この日に開始または終了する長期間イベントがあるかチェック
    const isStartOrEnd = filteredEvents.some(event => 
      !isSameDay(event.start, event.end) && (isSameDay(date, event.start) || isSameDay(date, event.end))
    );
    
    // この日が長期間イベントの中間日にあたるかチェック
    const isContinue = filteredEvents.some(event =>
      !isSameDay(event.start, event.end) && !isStartOrEnd && isWithinInterval(date, { start: event.start, end: event.end })
    );

    if (isStartOrEnd) {
      classNames.push('is-start-or-end-day');
    } else if (isContinue) {
      classNames.push('is-continue-day');
    }
    
    return { className: classNames.join(' ') };
  };

  // 2. イベントバー自体のスタイルを制御する
  const eventPropGetter: EventPropGetter<MyEvent> = (event, start, end, isSelected) => {
    const classNames = [];
    
    // 1日で完結するイベントかどうか
    const isSingleDay = isSameDay(event.start, event.end);
    if (isSingleDay) {
      classNames.push('is-single-day-event');
    } else {
      // 複数日イベントの場合
      const isStart = isSameDay(event.start, start); // このバーがイベントの開始日か
      const isEnd = isSameDay(event.end, end); // このバーがイベントの終了日か
      
      if (isStart) classNames.push('is-multi-day-start');
      else if (isEnd) classNames.push('is-multi-day-end');
      else classNames.push('is-multi-day-continue');
    }
    
    return { className: classNames.join(' ') };
  };

  // ★★★ ここまで ★★★

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
        ブルアカ カレンダー
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup /* ... */ >
           {/* ... Buttons ... */}
        </ButtonGroup>
      </Box>

      <Box sx={{ height: { xs: '70vh', md: '80vh' } }}>
        <Calendar
          localizer={localizer}
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          dayPropGetter={dayPropGetter} // 強化したdayPropGetterを適用
          eventPropGetter={eventPropGetter} // ★新設したeventPropGetterを適用
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          views={['month'] as View[]}
          formats={{ monthHeaderFormat: 'yyyy年 M月' }}
          messages={{ /* ... */ showMore: (total) => `他 ${total} 件` }}
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
        />
      </Box>
      
      <Modal /* ... */ >
        {/* ... */}
      </Modal>
    </Container>
  );
}

export default App;
