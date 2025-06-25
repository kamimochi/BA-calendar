import { useState, useMemo } from 'react';
import { Calendar, type View, type DateLocalizer, type Formats } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { dateFnsLocalizer } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Container,
  Button,
  ButtonGroup,
  Modal,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import eventsData from "./data/events.json";

// --- 型定義 ---
type EventData = { 
  id: number; 
  title: string; 
  start: string; 
  end?: string; 
  category: 'game' | 'goods' | 'event'; 
  description?: string; 
  url?: string; 
  urlText?: string; 
};

interface MyEvent { 
  id: number; 
  title: string; 
  start: Date; 
  end: Date; 
  category: 'game' | 'goods' | 'event'; 
  description?: string; 
  url?: string; 
  urlText?: string; 
}

// --- 初期データ設定 ---
const myEvents: MyEvent[] = (eventsData as EventData[]).map((event) => {
  const start = new Date(event.start);
  const end = event.end ? endOfDay(new Date(event.end)) : start;
  return { ...event, start, end, category: event.category as 'game' | 'goods' | 'event' };
});

const locales = { 'ja': ja, };
const localizer: DateLocalizer = dateFnsLocalizer({ 
  format, 
  parse, 
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }), 
  getDay, 
  locales 
});

// --- 日本語化対応 ---
const messages = {
  next: "次",
  previous: "前",
  today: "今日",
  month: "月",
  week: "週",
  day: "日",
  agenda: "一覧",
  allDay: "一日中",
  showMore: (total: number) => `他 ${total} 件`,
};

const formats: Formats = {
  monthHeaderFormat: 'yyyy年M月',
  dayHeaderFormat: 'M月d日(E)',
  weekdayFormat: 'E',
  agendaDateFormat: 'M月d日(E)',
  agendaHeaderFormat: ({ start, end }, culture, localizer) =>
    localizer!.format(start, 'M月d日(E)', culture) + ' - ' + localizer!.format(end, 'M月d日(E)', culture),
  timeGutterFormat: 'HH:mm',
};

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

// カテゴリー名の日本語マッピング
const categoryLabels = {
  game: 'ゲーム内イベント',
  goods: 'グッズ情報',
  event: 'イベント等'
};

// カテゴリー別の色設定
const categoryColors = {
  game: { bg: '#4caf50', color: 'white', label: 'success' as const },
  goods: { bg: '#ff9800', color: 'white', label: 'warning' as const },
  event: { bg: '#e91e63', color: 'white', label: 'error' as const }
};

function App() {
  const [calendarType, setCalendarType] = useState<'all' | 'game' | 'goods' | 'event'>('all');
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  const theme = useTheme();
  const isPc = useMediaQuery(theme.breakpoints.up('sm'));

  const filteredEvents = useMemo(() => {
    if (calendarType === 'all') {
      return myEvents;
    }
    return myEvents.filter(event => event.category === calendarType);
  }, [calendarType]);
  
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ★★★ これがすべての元凶でした。本当に申し訳ありません。★★★
  // ★★★ 引数の型を `MyEvent` に修正しました。 ★★★
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleShowMore = (date: Date) => {
    setCurrentView('day');
    setCurrentDate(date);
  };

  const dayPropGetter = (date: Date) => {
    const classNames = [];
    if (isSameDay(date, new Date())) {
      classNames.push('my-today');
    }
    const isStartOrEnd = filteredEvents.some(event => 
      !isSameDay(event.start, event.end) && 
      (isSameDay(date, event.start) || isSameDay(date, event.end))
    );
    const isContinue = filteredEvents.some(event => 
      !isSameDay(event.start, event.end) && 
      !isSameDay(date, event.start) && 
      !isSameDay(date, event.end) && 
      isWithinInterval(date, { start: startOfDay(event.start), end: endOfDay(event.end) })
    );
    if (isStartOrEnd) {
      classNames.push('is-start-or-end-day');
    } else if (isContinue) {
      classNames.push('is-continue-day');
    }
    return { className: classNames.join(' ') };
  };
  
  const eventPropGetter = (event: MyEvent, start: Date, end: Date, _isSelected: boolean) => {
    const style: React.CSSProperties = {};
    
    const categoryColor = categoryColors[event.category];
    style.backgroundColor = categoryColor.bg;
    style.color = categoryColor.color;
    
    const isMultiDay = !isSameDay(event.start, event.end);
    if (isMultiDay) {
      const isEventStart = isSameDay(start, event.start);
      const isEventEnd = isSameDay(end, event.end);

      if (!isEventStart && !isEventEnd) {
        style.opacity = 0.6;
      } else {
        style.opacity = 1.0;
      }
    } else {
      style.opacity = 1.0;
    }

    return { style };
  };

  const showLimitation = (currentView === 'week' || currentView === 'day') && 
    filteredEvents.some(event => !isSameDay(event.start, event.end));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
        ブルアカ カレンダー
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup variant="contained" aria-label="カレンダー種類選択ボタン" orientation={isPc ? 'horizontal' : 'vertical'}>
          <Button onClick={() => setCalendarType('all')} disabled={calendarType === 'all'}>すべて</Button>
          <Button onClick={() => setCalendarType('game')} disabled={calendarType === 'game'}>ゲーム内イベント</Button>
          <Button onClick={() => setCalendarType('goods')} disabled={calendarType === 'goods'}>グッズ情報</Button>
          <Button onClick={() => setCalendarType('event')} disabled={calendarType === 'event'}>リアルイベント</Button>
        </ButtonGroup>
      </Box>

      {showLimitation && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ※ 週間・日間ビューでは、複数日にわたるイベントの表示に制限があります。
            詳細な期間表示については月間ビューをご利用ください。
          </Typography>
        </Alert>
      )}

      <Box sx={{ height: { xs: '70vh', md: '80vh' } }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventPropGetter}
          view={currentView}
          onView={(view) => setCurrentView(view)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onShowMore={(_events, date) => handleShowMore(date)}
          onSelectEvent={handleSelectEvent}
          messages={messages}
          formats={formats}
          culture='ja'
          popup={true}
        />
      </Box>
      
      <Modal open={!!selectedEvent} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedEvent && (
            <Card>
              <CardHeader 
                title={selectedEvent.title}
                action={
                  <Chip 
                    label={categoryLabels[selectedEvent.category]}
                    color={categoryColors[selectedEvent.category].label}
                    size="small"
                  />
                }
              />
              <CardContent>
                <Typography component="div" sx={{ mb: 2 }}>
                  <strong>期間:</strong> {format(selectedEvent.start, 'yyyy年M月d日(E) HH:mm', { locale: ja })}
                  {selectedEvent.start.getTime() !== selectedEvent.end.getTime() && 
                    (isSameDay(selectedEvent.start, selectedEvent.end)
                      ? `-${format(selectedEvent.end, 'HH:mm')}`
                      : ` - ${format(selectedEvent.end, 'yyyy年M月d日(E) HH:mm', { locale: ja })}`)
                  }
                </Typography>
                {selectedEvent.description && ( 
                  <Typography sx={{ mb: 2 }}> 
                    <strong>詳細:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</span>
                  </Typography> 
                )}
                {selectedEvent.url && selectedEvent.urlText && ( 
                  <Typography sx={{ mt: 2 }}> 
                    <strong>リンク:</strong>{' '} 
                    <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer"> 
                      {selectedEvent.urlText} 
                    </a> 
                  </Typography> 
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default App;
