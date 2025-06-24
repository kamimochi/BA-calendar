import { useState, useMemo } from 'react';
import { Calendar, type View, type DateLocalizer } from 'react-big-calendar';
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
  useTheme,
  useMediaQuery,
} from '@mui/material';

import eventsData from "./data/events.json";

// --- 型定義 ---
type EventData = { id: number; title: string; start: string; end?: string; category: 'game' | 'goods' | 'event'; description?: string; url?: string; urlText?: string; };
interface MyEvent { id: number; title: string; start: Date; end: Date; category: 'game' | 'goods' | 'event'; description?: string; url?: string; urlText?: string; }

// --- 初期データ設定 ---
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
  // --- state定義 ---
  const [calendarType, setCalendarType] = useState<'all' | 'game' | 'goods' | 'event'>('all');
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  // 月表示に固定するため、viewのstateは削除し、直接指定します
  // const [currentView, setCurrentView] = useState<View>('month');

  const theme = useTheme();
  const isPc = useMediaQuery(theme.breakpoints.up('sm'));

  // フィルター処理済みのイベント
  const filteredEvents = useMemo(() => {
    if (calendarType === 'all') {
      return myEvents;
    }
    return myEvents.filter(event => event.category === calendarType);
  }, [calendarType]);

  // --- ハンドラ関数 ---
  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
  
  // onShowMoreは今回、CSSとdayPropGetterで見た目を制御するため、
  // クリックでビューを切り替える機能は一旦コメントアウトします。
  /*
  const handleShowMore = (date: Date) => {
    setCurrentView('day');
    setCurrentDate(date);
  };
  */

  // ★★★ dayPropGetterのロジックをよりシンプルで確実なものに修正 ★★★
  const dayPropGetter = (date: Date) => {
    const classNames = [];
    if (isSameDay(date, new Date())) {
      classNames.push('my-today');
    }

    // この日に長期間イベントが継続しているかを判定
    const isContinue = filteredEvents.some(event => {
      const isLongEvent = !isSameDay(event.start, event.end);
      const isMiddleDay = !isSameDay(date, event.start) && !isSameDay(date, event.end);
      return isLongEvent && isMiddleDay && isWithinInterval(date, { start: startOfDay(event.start), end: endOfDay(event.end) });
    });
    
    if (isContinue) {
      classNames.push('is-continue-day');
    }
    
    return classNames.length > 0 ? { className: classNames.join(' ') } : {};
  };

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
          // viewsを固定し、onViewを削除
          views={['month']} 
          view={'month'}
                    
          // onShowMore={(_events, date) => handleShowMore(date)}
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
          
          messages={{ next: "次", previous: "前", today: "今日", month: "月", week: "週", day: "日", showMore: (total) => `他 ${total} 件` }}
        />
      </Box>
      
      <Modal open={!!selectedEvent} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedEvent && (
            <Card>
              <CardHeader title={selectedEvent.title} />
              <CardContent>
                <Typography component="div">
                  <strong>期間:</strong> {format(selectedEvent.start, 'yyyy/MM/dd HH:mm')}
                  {!isSameDay(selectedEvent.start, selectedEvent.end) && ` - ${format(selectedEvent.end, 'yyyy/MM/dd HH:mm')}`}
                </Typography>
                {selectedEvent.description && ( <Typography sx={{ mt: 2 }}> <strong>詳細:</strong> {selectedEvent.description} </Typography> )}
                {selectedEvent.url && selectedEvent.urlText && ( <Typography sx={{ mt: 2 }}> <strong>リンク:</strong>{' '} <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer"> {selectedEvent.urlText} </a> </Typography> )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default App;
