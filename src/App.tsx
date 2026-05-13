/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  RotateCcw, 
  Trophy, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Hash,
  History as HistoryIcon
} from 'lucide-react';

type GameStatus = 'playing' | 'won' | 'lost';

interface GuessRecord {
  value: number;
  result: 'too-high' | 'too-low' | 'correct';
}

const MAX_ATTEMPTS = 10;

export default function App() {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [message, setMessage] = useState('輸入 1 到 100 之間的數字開始挑戰！');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setHistory([]);
    setStatus('playing');
    setMessage('輸入 1 到 100 之間的數字開始挑戰！');
    inputRef.current?.focus();
  };

  const handleGuess = (e?: FormEvent) => {
    e?.preventDefault();

    if (status !== 'playing') return;

    const numGuess = parseInt(guess);

    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('請輸入 1 到 100 之間的有效數字！');
      return;
    }

    if (history.some(h => h.value === numGuess)) {
      setMessage('你已經猜過這個數字了！');
      return;
    }

    const newHistory: GuessRecord[] = [
      { 
        value: numGuess, 
        result: numGuess === targetNumber ? 'correct' : numGuess > targetNumber ? 'too-high' : 'too-low' 
      },
      ...history
    ];

    setHistory(newHistory);
    setGuess('');

    if (numGuess === targetNumber) {
      setStatus('won');
      setMessage('恭喜你！正式答案就是 ' + targetNumber);
    } else if (newHistory.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setMessage('遊戲結束！正確答案是 ' + targetNumber);
    } else {
      setMessage(numGuess > targetNumber ? '太大了！' : '太小了！');
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - history.length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -z-10" />

        {/* Header */}
        <div className="p-8 pb-4 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4"
          >
            <Hash size={14} />
            Guess The Number
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">猜數字大挑戰</h1>
          <p className="text-slate-400 text-sm">目標：1 - 100 之間的一個數字</p>
        </div>

        {/* Status Area */}
        <div className="px-8 py-4">
          <div className="flex justify-between items-end mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">剩餘次數</span>
              <span className={`text-4xl font-mono leading-none ${attemptsLeft <= 3 ? 'text-rose-500' : 'text-indigo-400'}`}>
                {attemptsLeft.toString().padStart(2, '0')}
              </span>
            </div>
            
            <motion.div 
              key={message}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-right text-sm font-medium ${
                status === 'won' ? 'text-emerald-400' : status === 'lost' ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {message}
            </motion.div>
          </div>

          <form onSubmit={handleGuess} className="relative mb-8">
            <input
              ref={inputRef}
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={status !== 'playing'}
              placeholder={status === 'playing' ? "輸入數字..." : "遊戲已結束"}
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-6 px-6 text-2xl font-mono focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-800 disabled:opacity-50"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              {status === 'playing' ? (
                <button
                  type="submit"
                  className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
                >
                  <Send size={24} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startNewGame}
                  className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                  <RotateCcw size={24} />
                </button>
              )}
            </div>
          </form>

          {/* Results Modal/Overlay */}
          <AnimatePresence>
            {status !== 'playing' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex flex-col items-center justify-center p-6 mb-8 rounded-2xl border-2 ${
                  status === 'won' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-rose-500/10 border-rose-500/50'
                }`}
              >
                {status === 'won' ? (
                  <Trophy className="text-emerald-400 mb-4" size={48} />
                ) : (
                  <AlertCircle className="text-rose-400 mb-4" size={48} />
                )}
                <h3 className={`text-xl font-bold mb-2 ${status === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {status === 'won' ? '挑戰成功！' : '大限已到...'}
                </h3>
                <p className="text-slate-300 text-center mb-6">
                  {status === 'won' 
                    ? `太棒了！你在 ${history.length} 次內就猜對了。` 
                    : `雖然很可惜，但正確答案是 ${targetNumber}。再接再厲！`}
                </p>
                <button
                  onClick={startNewGame}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${
                    status === 'won' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30 shadow-lg' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30 shadow-lg'
                  }`}
                >
                  <RotateCcw size={18} />
                  重新開始
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Accordion */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              <HistoryIcon size={12} />
              Guess History
            </div>
            
            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-slate-700 text-sm flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 italic font-serif">?</div>
                    尚無猜測記錄
                  </motion.div>
                ) : (
                  history.map((record, index) => (
                    <motion.div
                      key={`${record.value}-${index}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      layout
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-slate-600">#{history.length - index}</span>
                        <span className="text-lg font-mono font-bold text-indigo-400">{record.value.toString().padStart(3, '0')}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-lg ${
                        record.result === 'correct' ? 'bg-emerald-500/10 text-emerald-400' :
                        record.result === 'too-high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {record.result === 'too-high' && <ArrowUp size={12} />}
                        {record.result === 'too-low' && <ArrowDown size={12} />}
                        {record.result === 'correct' && <Trophy size={12} />}
                        {record.result === 'too-high' ? '太大了' : record.result === 'too-low' ? '太小了' : '正確'}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-slate-800">
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
            Designed for Precision
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
