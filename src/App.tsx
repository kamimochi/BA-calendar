import { useState, useMemo } from 'react';
import { Calendar } from 'react-big-calendar'; 
import { format, parse, startOfWeek, getDay, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { dateFnsLocalizer } from 'react-big-calendar';

// スタイルシートとMUIコンポーネント
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
  useTheme,
  useMediaQuery,
} from '@mui/material';

// JSONインポート
import eventsData from "./data/events.json";

// ★修正点1: JSONデータの型をここで定義する
type EventData = {
  id: number;
  title: string;
  start: string;
  end?: string;
  category: 'game' | 'goods' | 'real_event';
  description?: string;
};

// 型定義 (カレンダーが内部で使うイベントの型)
interface MyEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  category: 'game' | 'goods' | 'real_event';
  description?: string;
}

// JSONの文字列の日付をDateオブジェクトに変換
// ★修正点2: eventsDataに先ほど定義した型を適用する
const myEvents: MyEvent[] = (eventsData as EventData[]).map((event) => ({
  ...event,
  start: new Date(event.start),
  end: new Date(event.end || event.start), 
  category: event.category as 'game' | 'goods' | 'real_event',
}));

// date-fnsのローカライザー設定
const locales = {
  'ja': ja,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

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
  const [calendarType, setCalendarType] = useState<'all' | 'game' | 'goods' | 'real_event'>('all');
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

  const dayPropGetter = (date: Date) => {
    const classNames = [];
    if (isSameDay(date, new Date())) {
      classNames.push('my-today');
    }
    const hasEvent = filteredEvents.some(event => 
      isWithinInterval(date, { start: startOfDay(event.start), end: endOfDay(event.end) })
    );
    if (hasEvent) {
      classNames.push('has-event');
    }
    return classNames.length > 0 ? { className: classNames.join(' ') } : {};
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
        ブルアカ カレンダー
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup 
          variant="contained" 
          aria-label="カレンダー種類選択ボタン"
          orientation={isPc ? 'horizontal' : 'vertical'}
        >
          <Button onClick={() => setCalendarType('all')} disabled={calendarType === 'all'}>すべて</Button>
          <Button onClick={() => setCalendarType('game')} disabled={calendarType === 'game'}>ゲーム内イベント</Button>
          <Button onClick={() => setCalendarType('goods')} disabled={calendarType === 'goods'}>グッズ情報</Button>
          <Button onClick={() => setCalendarType('real_event')} disabled={calendarType === 'real_event'}>リアルイベント</Button>
        </ButtonGroup>
      </Box>

      <Box sx={{ height: { xs: '70vh', md: '80vh' } }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          dayPropGetter={dayPropGetter}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          views={['month']}
          formats={{
            monthHeaderFormat: 'yyyy年 M月',
          }}
          messages={{
            next: "次",
            previous: "前",
            today: "今日",
            month: "月",
            week: "週",
            day: "日",
            agenda: "予定",
            date: "日付",
            time: "時間",
            event: "イベント",
          }}
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
        />
      </Box>

      <Modal
        open={!!selectedEvent}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          {selectedEvent && (
            <Card>
              <CardHeader title={selectedEvent.title} id="modal-title" />
              <CardContent>
                <Typography id="modal-description" component="div">
                  <strong>期間:</strong> {format(selectedEvent.start, 'yyyy/MM/dd HH:mm')}
                  {!isSameDay(selectedEvent.start, selectedEvent.end) && ` - ${format(selectedEvent.end, 'yyyy/MM/dd HH:mm')}`}
                </Typography>
                {selectedEvent.description && (
                  <Typography sx={{ mt: 2 }}>
                    <strong>詳細:</strong> {selectedEvent.description}
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
