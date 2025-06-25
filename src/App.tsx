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
} from '@mui/material'; // [4]
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
const myEvents: MyEvent[] = (eventsData as EventData[]).map((event) => { // [5]
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
const messages = { // [6]
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

const formats: Formats = { // [6]
  monthHeaderFormat: 'yyyy年M月',
  dayHeaderFormat: 'M月d日(E)',
  weekdayFormat: 'E',
  agendaDateFormat: 'M月d日(E)',
  agendaHeaderFormat: ({ start, end }, culture, localizer) =>
    localizer!.format(start, 'M月d日(E)', culture) + ' - ' + localizer!.format(end, 'M月d日(E)', culture),
  timeGutterFormat: 'HH:mm',
};

const modalStyle = { // [7]
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
  event: 'リアルイベント'
};

// カテゴリー別の色設定
const categoryColors = {
  game: { bg: '#4caf50', color: 'white', label: 'success' },
  goods: { bg: '#ff9800', color: 'white', label: 'warning' },
  event: { bg: '#e91e63', color: 'white', label: 'error' }
};

function App() { // [7]
  const [calendarType, setCalendarType] = useState<'all' | 'game' | 'goods' | 'event'>('all'); // [8]
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const theme = useTheme();
  const isPc = useMediaQuery(theme.breakpoints.up('sm'));

  const filteredEvents = useMemo(() => { // [8]
    if (calendarType === 'all') {
      return myEvents;
    }
    return myEvents.filter(event => event.category === calendarType);
  }, [calendarType]);

  const handleSelectEvent = (event: MyEvent) => { // [9]
    setSelectedEvent(event);
  };

  const handleCloseModal = () => { // [9]
    setSelectedEvent(null);
  };

  const handleShowMore = (date: Date) => { // [9]
    setCurrentView('day');
    setCurrentDate(date);
  };

  const dayPropGetter = (date: Date) => { // [9]
    const classNames = [];
    if (isSameDay(date, new Date())) {
      classNames.push('my-today');
    }

    const isStartOrEnd = filteredEvents.some(event =>
      !isSameDay(event.start, event.end) &&
      (isSameDay(date, event.start) || isSameDay(date, event.end))
    );

    const isContinue = filteredEvents.some(event => // [1]
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

  // ★★★ 改善版eventPropGetter：data-category属性とより明確なクラス名付与 ★★★
  // (ユーザー指定の修正により、data-category属性は含まれません)
  const eventPropGetter = (event: MyEvent, start: Date, end: Date, _isSelected: boolean) => {
    // ★★★ スタイルとクラス名の両方を準備 ★★★
    const style: React.CSSProperties = {};
    const classNames = [];
    
    // カテゴリー別の色を先に設定
    const categoryColor = categoryColors[event.category];
    style.backgroundColor = categoryColor.bg;
    style.color = categoryColor.color;
    
    // 複数日イベントの判定
    const isMultiDay = !isSameDay(event.start, event.end);
    if (isMultiDay) {
      if (isSameDay(start, event.start)) {
        classNames.push('my-event-start');
        style.opacity = 1.0; // 開始日は不透明
      } 
      else if (isSameDay(end, event.end)) {
        classNames.push('my-event-end');
        style.opacity = 1.0; // 終了日も不透明
      } 
      else {
        classNames.push('my-event-continue');
        style.opacity = 0.6; // ★★★ 中間日はここで不透明度を指定！ ★★★
      }
    } else {
        style.opacity = 1.0; // 単日イベントは不透明
    }

    return { style, className: classNames.join(' ') };
  };

  // 週間・日間ビューでの制限通知を表示するかどうか
  const showLimitation = (currentView === 'week' || currentView === 'day') &&
    filteredEvents.some(event => !isSameDay(event.start, event.end));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        ブルアカ カレンダー
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button onClick={() => setCalendarType('all')} disabled={calendarType === 'all'}>すべて</Button>
          <Button onClick={() => setCalendarType('game')} disabled={calendarType === 'game'}>ゲーム内イベント</Button>
          <Button onClick={() => setCalendarType('goods')} disabled={calendarType === 'goods'}>グッズ情報</Button>
          <Button onClick={() => setCalendarType('event')} disabled={calendarType === 'event'}>リアルイベント</Button>
        </ButtonGroup>
      </Box>

      {/* 週間・日間ビューでの制限に関する通知 */}
      {showLimitation && ( // [10]
        <Alert severity="info" sx={{ mb: 2 }}>
          ※ 週間・日間ビューでは、複数日にわたるイベントの表示に制限があります。<br />
          詳細な期間表示については月間ビューをご利用ください。
        </Alert>
      )}

      <div style={{ height: isPc ? '700px' : '500px' }}>
        <Calendar
          localizer={localizer} // [10]
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventPropGetter}
          view={currentView as View}
          onView={(view) => setCurrentView(view)}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onShowMore={(_events, date) => handleShowMore(date)}
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
          messages={messages} // [11]
          formats={formats}
          culture='ja'
          popup={true}
        />
      </div>

      {selectedEvent && ( // [11]
        <Modal
          open={Boolean(selectedEvent)}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Card variant="outlined">
              <CardHeader
                title={selectedEvent.title} // [11]
                action={
                  <Chip
                    label={categoryLabels[selectedEvent.category]}
                    color={categoryColors[selectedEvent.category].label as any}
                    size="small"
                  />
                }
              />
              <CardContent>
                <Typography id="modal-modal-description" sx={{ mt: 2 }} component="div">
                  <p><strong>カテゴリー:</strong> {categoryLabels[selectedEvent.category]}</p>
                  <p><strong>期間:</strong> {format(selectedEvent.start, 'yyyy年M月d日(E) HH:mm', { locale: ja })}
                    {selectedEvent.start.getTime() !== selectedEvent.end.getTime() &&
                      (isSameDay(selectedEvent.start, selectedEvent.end)
                        ? `-${format(selectedEvent.end, 'HH:mm')}` // [12]
                        : ` - ${format(selectedEvent.end, 'yyyy年M月d日(E) HH:mm', { locale: ja })}`)
                    }
                  </p>
                  {selectedEvent.description && ( // [12]
                    <p><strong>詳細:</strong> {selectedEvent.description}</p>
                  )}
                  {selectedEvent.url && selectedEvent.urlText && ( // [12]
                    <p><strong>リンク:</strong>{' '}
                      <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer">
                        {selectedEvent.urlText}
                      </a>
                    </p>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Modal>
      )}
    </Container>
  );
}

export default App;
