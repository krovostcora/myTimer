// app/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeLogs, setTimeLogs] = useState({});
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [now, setNow] = useState(new Date());
    const intervalRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const formatDateKey = (date) => date.toISOString().split('T')[0];

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

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
        if (selectedKey !== todayKey) return;
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
                    const dayName = item.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
                    const day = item.getDate();
                    const month = item.getMonth() + 1;
                    return (
                        <TouchableOpacity
                            onPress={() => setSelectedDate(item)}
                            style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                        >
                            <Text style={[styles.dayText, isSelected && styles.selectedText]}>{dayName}</Text>
                            <Text style={[styles.dateText, isSelected && styles.selectedText]}>{`${day}.${month}`}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            <View style={styles.centerContainer}>
                <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
                    <TouchableOpacity
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleToggle}
                        activeOpacity={0.8}
                        disabled={selectedKey !== todayKey}
                    >
                        <Text style={styles.timerText}>
                            {isTracking
                                ? `${String(running.hrs).padStart(2, '0')}:${String(running.mins).padStart(2, '0')}:${String(running.secs).padStart(2, '0')}`
                                : 'START'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={styles.logsContainer}>
                <ScrollView style={styles.logsScroll} contentContainerStyle={{ paddingBottom: 12 }}>
                    {entries.length === 0 && (
                        <Text style={styles.noLogsText}>No logs for this day</Text>
                    )}
                    {entries.map(({ start, end }, index) => {
                        const { hrs, mins } = calcDuration(new Date(start), new Date(end));
                        return (
                            <View key={index} style={styles.logEntry}>
                                <Text style={styles.logText}>
                                    {formatTime(new Date(start))} - {formatTime(new Date(end))}
                                </Text>
                                <Text style={styles.durationText}>
                                    {hrs > 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : ''} {mins > 0 ? `${mins} min` : ''}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {entries.length > 0 && (
                    <Text style={styles.totalText}>
                        Total: {totalDuration.hrs} hr{totalDuration.hrs !== 1 ? 's' : ''}, {totalDuration.mins} min
                    </Text>
                )}
            </View>
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
    dateList: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 12,
    },
    dateItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 6,
        height: 70,
        borderRadius: 16,
        backgroundColor: '#1B335A',
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    dateItemSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#AAD8FF',
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    dayText: {
        fontSize: 14,
        color: '#D8E3F0',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 16,
        color: '#D8E3F0',
        fontWeight: '700',
        marginTop: 4,
    },
    selectedText: {
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    centerContainer: {
        marginVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B6CBD',
        shadowOpacity: 0.7,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 12 },
        elevation: 15,
    },
    timerText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 2,
    },
    logsContainer: {
        width: '90%',
        maxHeight: 220,
        borderRadius: 18,
        backgroundColor: '#1B335A',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    logsScroll: {
        maxHeight: 180,
    },
    logEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    logText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D8E3F0',
    },
    durationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#A3B4CC',
    },
    noLogsText: {
        color: '#AAC8FF',
        fontWeight: '600',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    totalText: {
        marginTop: 8,
        color: '#AAD8FF',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'right',
    },
});
