// app/components/DateSelector.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateSelector({ selectedDate, onSelect }) {
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (date) => date.toLocaleDateString('en-GB');

    const isToday = (date) => {
        const now = new Date();
        return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    };

    const handlePress = () => {
        if (isToday(selectedDate) && showPicker) {
            setShowPicker(false);
        } else {
            setShowPicker(true);
        }
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={handlePress} style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    themeVariant="dark"
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, date) => {
                        if (date) {
                            onSelect(date);
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
    },
    dateText: {
        color: '#fff',
        fontSize: 30,
    },
});