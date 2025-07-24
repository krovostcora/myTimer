import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function LogsList({
                                     entries,
                                     calcDuration,
                                     formatTime,
                                     total,
                                     maxHeight,
                                 }) {
    const validLogs = entries.filter(log => {
        const start = new Date(log.start);
        const end = new Date(log.end);
        return (
            start instanceof Date &&
            !isNaN(start) &&
            end instanceof Date &&
            !isNaN(end)
        );
    });

    const totalMs = validLogs.reduce((sum, log) => {
        const start = new Date(log.start);
        const end = new Date(log.end);
        return sum + (end - start);
    }, 0);

    const totalMins = Math.floor(totalMs / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    return (
        <View style={[styles.box, { maxHeight }]}>
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.overlay} />
            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
                {entries.length === 0 && (
                    <Text style={styles.noLogs}>No logs for this day</Text>
                )}
                {entries.map((e, i) => {
                    const { hrs, mins } = calcDuration(e.start, e.end);
                    return (
                        <View key={i} style={styles.row}>
                            <Text style={styles.time}>
                                {formatTime(new Date(e.start))} -{' '}
                                {formatTime(new Date(e.end))}
                            </Text>
                            <Text style={styles.dur}>
                                {hrs > 0 && `${hrs} hr${hrs > 1 ? 's' : ''}`} {mins > 0 && `${mins} min`}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
            {validLogs.length > 0 && (
                <Text style={styles.total}>
                    Total: {hours} hrs, {mins} min
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        width: '90%',
        borderRadius: 26,
        overflow: 'hidden',
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 8,
        borderWidth: 0.3,
        borderColor: 'transparent',
        shadowColor: '#160932',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginBottom: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 18,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    time: { color: '#D8E3F0', fontWeight: '600', fontSize: 16 },
    dur: { color: '#26232e', fontWeight: '600', fontSize: 18 },
    noLogs: {
        color: '#160932',
        fontWeight: '600',
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 16,
    },
    total: {
        marginTop: 8,
        color: '#160932',
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'right',
    },
});