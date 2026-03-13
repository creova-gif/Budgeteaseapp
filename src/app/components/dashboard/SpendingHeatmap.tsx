import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '@/app/App';

export function SpendingHeatmap() {
  const { state } = useApp();
  const lang = state.language;

  const DAY_LABELS = {
    sw: ['Jpl', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
  const HOUR_BLOCKS = ['6am', '12pm', '6pm', '12am'];

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();

  // Day-of-week spending
  const daySpend = useMemo(() => {
    const buckets = Array(7).fill(0);
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => { buckets[t.date.getDay()] += t.amount; });
    return buckets;
  }, [state.transactions]);

  const maxDay = Math.max(...daySpend, 1);

  // Hour-of-day spending (6 buckets of 4h each)
  const hourSpend = useMemo(() => {
    const buckets = Array(6).fill(0);
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const h = t.date.getHours();
        buckets[Math.floor(h / 4)] += t.amount;
      });
    return buckets;
  }, [state.transactions]);

  const maxHour = Math.max(...hourSpend, 1);

  // 4-week heatmap grid: rows=4 weeks, cols=7 days
  const heatmapGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 4 }, () => Array(7).fill(0));
    const now = new Date();
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const daysAgo = Math.floor((now.getTime() - t.date.getTime()) / 86400000);
        if (daysAgo < 0 || daysAgo >= 28) return;
        const week = Math.floor(daysAgo / 7);
        const day = t.date.getDay();
        grid[3 - week][day] += t.amount;
      });
    return grid;
  }, [state.transactions]);

  const maxCell = Math.max(...heatmapGrid.flat(), 1);

  const getCellColor = (val: number) => {
    const intensity = val / maxCell;
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 0.2) return 'bg-emerald-100';
    if (intensity < 0.4) return 'bg-emerald-200';
    if (intensity < 0.6) return 'bg-emerald-400';
    if (intensity < 0.8) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const hasData = state.transactions.some(t => t.type === 'expense');

  const peakDay = daySpend.indexOf(Math.max(...daySpend));
  const peakDayName = DAY_LABELS[lang][peakDay];
  const peakHour = hourSpend.indexOf(Math.max(...hourSpend));
  const hourLabels = ['12am', '4am', '8am', '12pm', '4pm', '8pm'];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-bold text-gray-900 mb-0.5">
          {lang === 'sw' ? '🌡️ Ramani ya Matumizi' : '🌡️ Spending Heatmap'}
        </h3>
        <p className="text-xs text-gray-400">
          {lang === 'sw' ? 'Wiki 4 zilizopita — rangi nyekundu = matumizi zaidi' : 'Last 4 weeks — darker = more spending'}
        </p>
      </div>

      {!hasData ? (
        <div className="px-4 pb-6 pt-2 text-center">
          <p className="text-sm text-gray-400">
            {lang === 'sw' ? 'Ongeza miamala ili kuona ramani' : 'Add transactions to see heatmap'}
          </p>
        </div>
      ) : (
        <>
          {/* 4-week calendar heatmap */}
          <div className="px-4 pb-4">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_LABELS[lang].map(d => (
                <div key={d} className="text-center text-xs text-gray-400">{d}</div>
              ))}
            </div>
            {/* Week rows */}
            {heatmapGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((val, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.01 }}
                    className={`h-7 rounded-md ${getCellColor(val)} cursor-default`}
                    title={val > 0 ? `TSh ${val.toLocaleString()}` : ''}
                  />
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-2 justify-end">
              <span className="text-xs text-gray-400">{lang === 'sw' ? 'Kidogo' : 'Less'}</span>
              {['bg-gray-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-orange-400', 'bg-red-500'].map(c => (
                <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
              <span className="text-xs text-gray-400">{lang === 'sw' ? 'Zaidi' : 'More'}</span>
            </div>
          </div>

          {/* Peak insights */}
          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{lang === 'sw' ? '📅 Siku ya Juu' : '📅 Peak Day'}</p>
              <p className="text-sm font-bold text-orange-700">{peakDayName}</p>
              <p className="text-xs text-gray-500">{fmt(daySpend[peakDay])}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">{lang === 'sw' ? '🕐 Wakati wa Juu' : '🕐 Peak Hour'}</p>
              <p className="text-sm font-bold text-blue-700">{hourLabels[peakHour]}</p>
              <p className="text-xs text-gray-500">{fmt(hourSpend[peakHour])}</p>
            </div>
          </div>

          {/* Day-of-week bars */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 mb-2">
              {lang === 'sw' ? 'Wastani wa Siku ya Wiki' : 'Day of Week Average'}
            </p>
            <div className="flex items-end gap-1.5 h-12">
              {daySpend.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <motion.div
                    className={`w-full rounded-t-sm ${i === peakDay ? 'bg-orange-400' : 'bg-emerald-400'}`}
                    animate={{ height: `${(val / maxDay) * 40}px` }}
                    initial={{ height: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    style={{ minHeight: val > 0 ? 4 : 0 }}
                  />
                  <span className="text-xs text-gray-400">{DAY_LABELS[lang][i].slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
