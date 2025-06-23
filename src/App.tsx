import React, { useState, useMemo } from 'react';
// ★修正点1: 型は 'type' を使ってインポートする
import { Calendar, type EventWrapperProps } from 'react-big-calendar'; 
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
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }), getDay, locales });

// ★修正点2: カスタムラッパーのPropsの型を正しく定義し、引数を受け取る
// EventWrapperProps には children が含まれないため、React.PropsWithChildren でラップする
const MyEventWrapper: React.FC<React.PropsWithChildren<EventWrapperProps>> = ({ children, continuesPrior, continuesAfter }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const style = useMemo(() => {
    // 複数日にまたがるイベントの中間日かどうかを判定
    const isContinue = continuesPrior && continuesAfter;

    // ★修正点3: childrenがReact要素であることを確認し、元のスタイルを取得
    const originalStyle = React.isValidElement(children) ? children.props.style : {};

    if (isContinue) {
      // 中間日のスタイル
      return {
        ...originalStyle, // 元のスタイルを展開
        backgroundColor: isDarkMode ? 'rgba(18, 129, 232, 0.15)' : '#eaf6ff',
        color: 'transparent',
        borderLeft: 'none',
        borderRight: 'none',
      };
    }

    // 開始日、終了日、1日イベントはデフォルトのスタイルをそのまま使う
    return originalStyle;
  }, [children, continuesPrior, continuesAfter, isDarkMode]);

  // ★修正点4: childrenが有効なReact要素かチェックしてからクローンする
  if (!React.isValidElement(children)) {
    return null;
  }
  
  // スタイルを適用した子要素(イベント本体)を返す
  return React.cloneElement(children, { style });
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
          sx={{
            '& .Mui-disabled': {
              backgroundColor: '#333',
              color: 'white'
            }
          }}
        >
          <Button onClick={() => setCalendarType('all')} disabled={calendarType === 'all'}>すべて</Button>
          <Button onClick={() => setCalendarType('game')} disabled={calendarType === 'game'}>ゲーム内イベント</Button>
          <Button onClick={() => setCalendarType('goods')} disabled={calendarType === 'goods'}>グッズ情報</Button>
          <Button onClick={() => setCalendarType('event')} disabled={calendarType === 'event'}>リアルイベント</Button>
        </ButtonGroup>
      </Box>

      <Box sx={{ height: { xs: '70vh', md: '80vh' } }}>
        <Calendar
          localizer={localizer}
          events={myEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          dayPropGetter={dayPropGetter}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          views={['month']}
          formats={{ monthHeaderFormat: 'yyyy年 M月' }}
          messages={{
            next: "次", previous: "前", today: "今日", month: "月", week: "週", day: "日",
            agenda: "予定", date: "日付", time: "時間", event: "イベント",
            showMore: (total) => `他 ${total} 件`, 
          }}
          onSelectEvent={(event) => handleSelectEvent(event as MyEvent)}
          // ★修正点5: eventWrapperの型がMyEventに合わない問題を解決するため、anyキャストで一旦回避
          // 本来はより厳密な型定義が必要ですが、まずは動かすことを優先します。
          components={{
            eventWrapper: MyEventWrapper as React.ElementType<EventWrapperProps<MyEvent>>,
          }}
        />
      </Box>
      
      <Modal open={!!selectedEvent} onClose={handleCloseModal} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={modalStyle}>
          {selectedEvent && (
            <Card>
              <CardHeader title={selectedEvent.title} id="modal-title" />
              <CardContent>
                <Typography id="modal-description" component="div">
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
