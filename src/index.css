:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  /* ライトモード時のデフォルト色 */
  --color-text: #213547;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

/* MUIボタンとの競合を避けるため、デフォルトのbuttonスタイルは必要最低限に */
button:not(.MuiButton-root) {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:not(.MuiButton-root):hover {
  border-color: #646cff;
}
button:not(.MuiButton-root):focus,
button:not(.MuiButton-root):focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    /* ダークモード時のデフォルト色 */
    --color-text-dark: rgba(255, 255, 255, 0.87);
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button:not(.MuiButton-root) {
    background-color: #f9f9f9;
  }
}

/* --- ここからがアプリ独自のスタイル --- */

/* 「今日」のセルのデフォルト背景色をなくす */
.rbc-month-view .my-today {
  background-color: transparent !important;
}

/* 「今日」の日付の数字（リンク）のスタイル */
.my-today .rbc-button-link {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #1281e8; 
  background-color: transparent !important;
  color: var(--color-text, #213547);
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* 日付が選択された時のスタイル */
.rbc-button-link.rbc-active {
  background-color: #1281e8 !important;
  color: white !important;
  border-radius: 50%;
  border-color: transparent;
  width: 30px;
  height: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

/* イベントがある日の背景色 */
.rbc-day-bg.has-event:not(.rbc-off-range-bg) {
  background-color: #eaf6ff;
}

/* ★★★ 今回の修正箇所(1) ★★★ */
/* 長期間イベントの「間の日」の不透明度を下げる */
.rbc-event.rbc-event-continue {
  opacity: 0.5;
}
/* ホバーした時は元に戻して操作しやすくする */
.rbc-event.rbc-event-continue:hover {
  opacity: 1;
}

/* ★★★ 今回の修正箇所(2) ★★★ */
/* 「他x件」リンクのスタイル */
.rbc-show-more {
  color: #3174ad; /* ライトモード時の色 */
  text-decoration: none;
  background: rgba(0, 0, 0, 0.1);
  padding: 1px 5px;
  border-radius: 5px;
}
.rbc-show-more:hover {
  color: #265985;
}


/* --- ダークモード時のスタイル --- */
@media (prefers-color-scheme: dark) {
  /* ダークモード時の「今日」の文字色 */
  .my-today .rbc-button-link {
    color: var(--color-text-dark, rgba(255, 255, 255, 0.87));
  }
  
  /* ダークモード時のイベント背景色 */
  .rbc-day-bg.has-event:not(.rbc-off-range-bg) {
    background-color: rgba(18, 129, 232, 0.15); 
  }

  /* ダークモード時のカレンダーツールバーの文字色 */
  .rbc-toolbar .rbc-toolbar-label,
  .rbc-toolbar button {
    color: rgba(255, 255, 255, 0.87);
  }
  .rbc-toolbar button:disabled {
    color: rgba(255, 255, 255, 0.5);
  }

  /* ダークモード時の前月・次月の日付の「背景色」を修正 */
  .rbc-off-range-bg {
    background-color: transparent !important;
  }
  
  /* ★★★ 今回の修正箇所(3) ★★★ */
  /* ダークモード時の「他x件」の文字色 */
  .rbc-show-more {
    color: #a0cff7 !important; /* 白に近い青色で見やすく */
    background: rgba(255, 255, 255, 0.1);
  }
}

/* --- スマホ表示用のスタイル調整 --- */
@media (max-width: 600px) {
  .rbc-month-view .rbc-day-bg .rbc-button-link {
    font-size: 0.8rem;
  }
  
  .my-today .rbc-button-link,
  .rbc-button-link.rbc-active {
    width: 26px;
    height: 26px;
  }
}
