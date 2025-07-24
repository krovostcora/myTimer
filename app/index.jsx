// app/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeLogs, setTimeLogs] = useState({});
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [now, setNow] = useState(new Date());
    const intervalRef = useRef(null);

    const formatDateKey = (date) => date.toISOString().split('T')[0];


    const todayKey = formatDateKey(new Date());
    const selectedKey = formatDateKey(selectedDate);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const stored = await AsyncStorage.getItem('timeLogs');
                if (stored) setTimeLogs(JSON.parse(stored));
            } catch (e) {
                console.log('Failed to load logs', e);
            }
        };
        loadLogs();
    }, []);

    useEffect(() => {
        if (isTracking) {
            intervalRef.current = setInterval(() => setNow(new Date()), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isTracking]);


    const formatTime = (date) => date.toTimeString().slice(0, 5);

    const getToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    const getDateRange = () => {
        const center = getToday();
        const range = [];
        for (let i = -2; i <= 2; i++) {
            const d = new Date(center);
            d.setDate(center.getDate() + i);
            range.push(d);
        }
        return range;
    };

    const calcDuration = (start, end) => {
        if (!start || !end || isNaN(start) || isNaN(end)) return { hrs: 0, mins: 0, secs: 0 };
        const ms = end - start;
        if (ms <= 0) return { hrs: 0, mins: 0, secs: 0 };
        const secsTotal = Math.floor(ms / 1000);
        const hrs = Math.floor(secsTotal / 3600);
        const mins = Math.floor((secsTotal % 3600) / 60);
        const secs = secsTotal % 60;
        return { hrs, mins, secs };
    };

    const getTotalTime = (entries) => {
        return entries.reduce(
            (acc, { start, end }) => {
                const { hrs, mins } = calcDuration(new Date(start), new Date(end));
                return {
                    hrs: acc.hrs + hrs,
                    mins: acc.mins + mins,
                };
            },
            { hrs: 0, mins: 0 }
        );
    };

    const normalizeTime = ({ hrs, mins }) => {
        const totalMins = hrs * 60 + mins;
        return {
            hrs: Math.floor(totalMins / 60),
            mins: totalMins % 60,
        };
    };

    const handleToggle = async () => {
        if (selectedKey !== todayKey) return; // only allow today
        if (!isTracking) {
            const start = new Date();
            setStartTime(start);
            setIsTracking(true);
        } else if (startTime) {
            const endTime = new Date();
            const newEntry = {
                start: startTime.toISOString(),
                end: endTime.toISOString(),
            };
            const prevLogs = timeLogs[selectedKey] || [];
            const updatedLogs = { ...timeLogs, [selectedKey]: [...prevLogs, newEntry] };
            setTimeLogs(updatedLogs);
            try {
                await AsyncStorage.setItem('timeLogs', JSON.stringify(updatedLogs));
            } catch (e) {
                console.log('Failed to save logs', e);
            }
            setIsTracking(false);
            setStartTime(null);
        }
    };

    const entries = timeLogs[selectedKey] || [];
    const total = normalizeTime(getTotalTime(entries));
    const running = isTracking ? calcDuration(startTime, now) : { hrs: 0, mins: 0, secs: 0 };
    const totalDuration = normalizeTime({
        hrs: total.hrs + running.hrs,
        mins: total.mins + running.mins,
    });

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={getDateRange()}
                keyExtractor={(item) => item.toISOString()}
                contentContainerStyle={styles.dateList}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isSelected = formatDateKey(item) === selectedKey;
                    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' })[0];
                    const day = item.getDate();
                    const month = item.getMonth() + 1;
                    return (
                        <TouchableOpacity
                            onPress={() => setSelectedDate(item)}
                            style={styles.dateItem}
                        >
                            <Text style={[styles.dayText, isSelected && styles.selectedText]}>{dayName}.</Text>
                            <Text style={[styles.dateText, isSelected && styles.selectedText]}>{day}.{month}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Central fixed button */}
            <View style={styles.centerContainer}>
                <TouchableOpacity style={styles.circle} onPress={handleToggle} activeOpacity={0.7}>
                    <Text style={styles.timerText}>
                        {isTracking
                            ? `${String(running.hrs).padStart(2, '0')}:${String(running.mins).padStart(2, '0')}:${String(running.secs).padStart(2, '0')}`
                            : 'Start'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Logs */}
            <View style={styles.logs}>
                {entries.map(({ start, end }, index) => {
                    const { hrs, mins } = calcDuration(new Date(start), new Date(end));
                    return (
                        <Text key={index} style={styles.logText}>
                            {formatTime(new Date(start))} - {formatTime(new Date(end))} - {hrs} hr{hrs !== 1 ? 's' : ''}{mins > 0 ? ` ${mins} min` : ''}
                        </Text>
                    );
                })}
                <Text style={styles.totalText}>Total: {totalDuration.hrs} hrs, {totalDuration.mins} min</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        alignItems: 'center',
    },
    dateList: {
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    dateItem: {
        alignItems: 'center',
        width: width / 5,
    },
    dayText: {
        fontSize: 18,
        color: '#999',
    },
    dateText: {
        fontSize: 16,
        color: '#999',
    },
    selectedText: {
        color: '#000',
        fontWeight: 'bold',
    },
    centerContainer: {
        position: 'absolute',
        top: height / 2 - 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 22,
        fontWeight: '600',
    },
    logs: {
        position: 'absolute',
        bottom: 32,
        width: '80%',
        gap: 8,
    },
    logText: {
        fontSize: 16,
        color: '#333',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },
});
