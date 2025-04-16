'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import type { MealEntry } from '../lib/types';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lunch, setLunch] = useState<number>(0);
  const [dinner, setDinner] = useState<number>(0);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Calculate totals
  const totalLunches = entries.reduce((sum, entry) => sum + entry.lunch, 0);
  const totalDinners = entries.reduce((sum, entry) => sum + entry.dinner, 0);
  const totalDays = entries.length;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/meals');
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setMessage('Error fetching entries. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Add strict date validation
    const selectedDateStr = format(selectedDate, 'MM/dd/yyyy').replace(/\b0/g, '');
    const duplicateEntry = entries.find(entry => entry.date === selectedDateStr);
    
    if (duplicateEntry) {
      setLoading(false);
      setMessage('Error: An entry for this date already exists. Please select a different date.');
      return;
    }

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDateStr,
          lunch,
          dinner,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Entry added successfully!');
        setLunch(0);
        setDinner(0);
        // Add a small delay before fetching to allow Google Sheets to update
        setTimeout(() => {
          fetchEntries();
        }, 2000);
      } else {
        setMessage(data.error || 'Error adding entry. Please try again.');
      }
    } catch (error) {
      setMessage('Error adding entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RadioOption = ({ value, selected, onChange, label }: {
    value: number;
    selected: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <label className={`
      flex items-center justify-center w-full p-4 rounded-xl cursor-pointer
      transition-all duration-200 text-lg font-semibold shadow-md
      ${selected === value
        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white ring-2 ring-white/40'
        : 'bg-gray-700/80 hover:bg-gray-600/80 text-white/80'}
    `}>
      <input
        type="radio"
        className="hidden"
        checked={selected === value}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <main className="w-full max-w-4xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-center mb-16 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-transparent bg-clip-text">
          Mess Tracker
        </h1>

        {/* Add Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800/60 rounded-2xl p-6 border border-gray-600 text-center">
            <div className="text-3xl font-bold text-sky-400">{totalLunches}</div>
            <div className="text-gray-400 mt-1">Total Lunches</div>
          </div>
          <div className="bg-gray-800/60 rounded-2xl p-6 border border-gray-600 text-center">
            <div className="text-3xl font-bold text-purple-400">{totalDinners}</div>
            <div className="text-gray-400 mt-1">Total Dinners</div>
          </div>
          <div className="bg-gray-800/60 rounded-2xl p-6 border border-gray-600 text-center">
            <div className="text-3xl font-bold text-indigo-400">{totalDays}</div>
            <div className="text-gray-400 mt-1">Total Days</div>
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-3xl p-10 border border-gray-600 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-lg font-medium mb-2">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-inner"
                wrapperClassName="w-full"
                calendarClassName="bg-gray-900 text-white border border-gray-600 rounded-xl"
                showPopperArrow={false}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div>
                <label className="block text-lg font-medium mb-4">Lunch</label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((value) => (
                    <RadioOption
                      key={`lunch-${value}`}
                      value={value}
                      selected={lunch}
                      onChange={setLunch}
                      label={value.toString()}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium mb-4">Dinner</label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((value) => (
                    <RadioOption
                      key={`dinner-${value}`}
                      value={value}
                      selected={dinner}
                      onChange={setDinner}
                      label={value.toString()}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-purple-600 
                text-white text-xl font-semibold rounded-2xl hover:from-sky-600 hover:to-purple-700 
                focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 transition-transform duration-200
                active:scale-95"
            >
              {loading ? 'Adding...' : 'Add Entry'}
            </button>

            {message && (
              <div className={`text-center p-4 mt-4 rounded-2xl text-lg font-medium shadow-md backdrop-blur-md ${
                message.includes('Error')
                  ? 'bg-red-800/60 text-red-100 border border-red-700'
                  : 'bg-green-800/60 text-green-100 border border-green-700'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-sky-400 mb-6">Recent Entries</h2>
          <div className="bg-gray-800/60 rounded-3xl shadow-xl border border-gray-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-center">Lunch</th>
                    <th className="px-6 py-4 text-center">Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{entry.date}</td>
                      <td className="px-6 py-4 text-center">{entry.lunch}</td>
                      <td className="px-6 py-4 text-center">{entry.dinner}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                        No entries yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
