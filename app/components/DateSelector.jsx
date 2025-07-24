// app/components/DateSelector.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateSelector({ selectedDate, onSelect }) {
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, date) => {
                        if (date) {
                            onSelect(date); // просто викликати
                        }
                        setShowPicker(false);
                    }}
                    maximumDate={new Date()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    dateButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        // backgroundColor: '#1e3a5f',
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
    },
});
