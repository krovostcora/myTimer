import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { BlurView } from 'expo-blur';

export default function LogsList({
                                     entries,
                                     calcDuration,
                                     formatTime,
                                     total,
                                     maxHeight,
                                     minHeight,
                                     onDelete,
                                     onSaveNote, // callback: (index, note) => void
                                 }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [noteModal, setNoteModal] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [noteForIndex, setNoteForIndex] = useState(null);

    const openNoteModal = (i, currentNote) => {
        setNoteText(currentNote || '');
        setNoteForIndex(i);
        setNoteModal(true);
    };

    const handleSaveNote = () => {
        if (onSaveNote && noteForIndex !== null) {
            onSaveNote(noteForIndex, noteText.slice(0, 50));
        }
        setNoteModal(false);
        setSelectedIndex(null);
        setNoteText('');
        setNoteForIndex(null);
    };

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
        <View style={[styles.box, { minHeight, maxHeight }]}>
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.overlay} />
            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
                {entries.length === 0 && (
                    <Text style={styles.noLogs}>No logs for this day</Text>
                )}
                {entries.map((e, i) => {
                    const { hrs, mins } = calcDuration(e.start, e.end);
                    const isSelected = selectedIndex === i;
                    return (
                        <TouchableOpacity
                            key={i}
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={() => setSelectedIndex(isSelected ? null : i)}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.time}>
                                        {formatTime(new Date(e.start))} - {formatTime(new Date(e.end))}
                                    </Text>
                                    <Text style={styles.dur}>
                                        {hrs > 0 && `${hrs} hr${hrs > 1 ? 's' : ''}`} {mins > 0 && `${mins} min`}
                                    </Text>
                                </View>
                                {e.note ? (
                                    <Text style={styles.noteDisplay}>{e.note}</Text>
                                ) : null}
                                {isSelected && (
                                    <View style={[styles.actionBtns, { marginTop: 6 }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedIndex(null);
                                                onDelete && onDelete(i);
                                            }}
                                            style={styles.actionBtn}
                                        >
                                            <Text style={styles.deleteText}>Delete</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => openNoteModal(i, e.note)}
                                            style={styles.actionBtn}
                                        >
                                            <Text style={styles.noteText}>Make a note</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            {validLogs.length > 0 && (
                <Text style={styles.total}>
                    Total: {hours} hrs, {mins} min
                </Text>
            )}

            {/* Note Modal */}
            <Modal
                visible={noteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setNoteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <TextInput
                            style={styles.input}
                            value={noteText}
                            onChangeText={t => setNoteText(t.slice(0, 50))}
                            maxLength={50}
                            placeholder="Type your note..."
                        />
                        <Text style={{ color: '#888', fontSize: 12, alignSelf: 'flex-end' }}>
                            {noteText.length}/50
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                            <Button
                                title="Cancel" onPress={() => setNoteModal(false)} />
                            <View style={{ width: 12 }} />
                            <Button
                                title="Save" onPress={handleSaveNote} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    noteDisplay: {
        color: '#160932',
        fontSize: 14,
        marginTop: 2,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.79)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderRadius: 12,
        padding: 20,
        width: 310,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    box: {
        overflow: 'hidden',
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 5,
        borderColor: 'transparent',
        backgroundColor: 'rgba(255,255,255,0.03)',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 6,
        paddingHorizontal: 2,
        borderRadius: 8,
    },
    time: { marginBottom: 5, color: '#D8E3F0', fontWeight: '700', fontSize: 20 },
    dur: { color: '#26232e', fontWeight: '500', fontSize: 16 },
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
    actionBtns: {
        flexDirection: "row",
        alignItems: 'flex-end',
        gap: 15,
        marginVertical: 10,
    },
    actionBtn: {
        backgroundColor: 'rgba(255,255,255,0.63)',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        paddingTop: 5,
        marginLeft: 6,
    },
    deleteText: {
        fontSize: 14,
        color: '#e74c3c',
        fontWeight: '700',
    },
    noteText: {
        fontSize: 14,
        color: '#2980b9',
        fontWeight: '700',
    },
});