import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateSelector from './components/DateSelector';
import TimerButton from './components/TimerButton';
import LogsList from './components/LogsList';

const { height } = Dimensions.get('window');

const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
    };
const formatTime = (date) => date.toTimeString().slice(0, 5);

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeLogs, setTimeLogs] = useState({});
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [running, setRunning] = useState({ hrs: 0, mins: 0, secs: 0 });

    const todayKey = formatDateKey(new Date());
    const selectedKey = formatDateKey(selectedDate);
    const prevDateRef = useRef(selectedDate);

    const isToday = (date) => {
        const now = new Date();
        return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    };

    useEffect(() => {
        const loadLogs = async () => {
            const stored = await AsyncStorage.getItem('timeLogs');
            if (stored) {
                const logs = JSON.parse(stored);
                setTimeLogs(logs);

                const todayLogs = logs[todayKey] || [];
                const last = todayLogs[todayLogs.length - 1];
                if (last && !last.end) {
                    setIsTracking(true);
                    setStartTime(new Date(last.start));
                }
            }
        };
        loadLogs();
    }, []);

    useEffect(() => {
        let interval;
        if (isTracking && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const duration = calcDuration(startTime, now);
                setRunning(duration);
            }, 1000);
        } else {
            setRunning({ hrs: 0, mins: 0, secs: 0 });
        }
        return () => clearInterval(interval);
    }, [isTracking, startTime]);

    useEffect(() => {
        const prevDate = prevDateRef.current;

        // Якщо переключаєшся з "сьогодні" на іншу дату — зберігаємо лог
        if (isTracking && isToday(prevDate) && !isToday(selectedDate)) {
            const end = new Date();
            const newEntry = { start: startTime, end };
            const updatedLogs = {
                ...timeLogs,
                [formatDateKey(prevDate)]: [...(timeLogs[formatDateKey(prevDate)] || []), newEntry],
            };
            setTimeLogs(updatedLogs);
            AsyncStorage.setItem('timeLogs', JSON.stringify(updatedLogs));
            setIsTracking(false);
            setStartTime(null);
        }

        // Якщо повертаємось на "сьогодні", перевіряємо незавершений лог
        if (isToday(selectedDate)) {
            const todayLogs = timeLogs[todayKey] || [];
            const last = todayLogs[todayLogs.length - 1];
            if (last && !last.end) {
                setIsTracking(true);
                setStartTime(new Date(last.start));
            }
        }

        prevDateRef.current = selectedDate;
    }, [selectedDate]);

    const onSelectDate = (date) => {
        setSelectedDate(date);
    };

    const toggleTracking = async () => {
        if (selectedKey !== todayKey) return;

        if (!isTracking) {
            const now = new Date();
            setStartTime(now);
            setIsTracking(true);
            return;
        }

        const end = new Date();
        const newEntry = { start: startTime, end };
        const updatedLogs = {
            ...timeLogs,
            [selectedKey]: [...(timeLogs[selectedKey] || []), newEntry],
        };
        setTimeLogs(updatedLogs);
        await AsyncStorage.setItem('timeLogs', JSON.stringify(updatedLogs));
        setIsTracking(false);
        setStartTime(null);
    };

    const calcDuration = (start, end) => {
        if (!start || !end) return { hrs: 0, mins: 0, secs: 0 };
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        if (diffMs < 0) return { hrs: 0, mins: 0, secs: 0 };
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return { hrs, mins, secs };
    };

    const sumDurations = (arr) => {
        return arr.reduce(
            (acc, cur) => {
                const dur = calcDuration(cur.start, cur.end ?? new Date());
                let totalSecsAcc = acc.hrs * 3600 + acc.mins * 60 + acc.secs;
                let totalSecsCur = dur.hrs * 3600 + dur.mins * 60 + dur.secs;
                let sumSecs = totalSecsAcc + totalSecsCur;
                return {
                    hrs: Math.floor(sumSecs / 3600),
                    mins: Math.floor((sumSecs % 3600) / 60),
                    secs: sumSecs % 60,
                };
            },
            { hrs: 0, mins: 0, secs: 0 }
        );
    };

    const entries = timeLogs[selectedKey] || [];
    const total = sumDurations(entries);

    return (
        <View style={styles.container}>
            <DateSelector selectedDate={selectedDate} onSelect={onSelectDate} />
            {isToday(selectedDate) && (
                <TimerButton
                    isTracking={isTracking}
                    running={running}
                    disabled={false}
                    onToggle={toggleTracking}
                />
            )}
            <LogsList
                entries={entries}
                calcDuration={calcDuration}
                formatTime={formatTime}
                total={total}
                maxHeight={height * 0.3}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1D3A',
        paddingTop: 50,
        alignItems: 'center',
    },
});
