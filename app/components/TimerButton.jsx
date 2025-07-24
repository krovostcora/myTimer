// app/components/TimerButton.jsx
import React, { useRef } from 'react';
import { Pressable, Animated, Text, StyleSheet } from 'react-native';

export default function TimerButton({ isTracking, running, disabled, onToggle }) {
    const scale = useRef(new Animated.Value(1)).current;

    const animate = (to) => Animated.spring(scale, { toValue: to, useNativeDriver: true }).start();

    return (
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Pressable
                onPressIn={() => animate(0.9)}
                onPressOut={() => animate(1)}
                onPress={onToggle}
                disabled={disabled}
                style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.7 }]}
            >
                <Text style={styles.text}>
                    {isTracking
                        ? `${String(running.hrs).padStart(2, '0')}:${String(running.mins).padStart(2, '0')}:${String(running.secs).padStart(2, '0')}`
                        : 'START'}
                </Text>
            </Pressable>
        </Animated.View>
    );
}

// const styles = StyleSheet.create({
//     circle: {
//         borderRadius: 50,
//         backgroundColor: '#007AFF',
//         width: 100,
//         height: 100,
//         justifyContent: 'center',
//         alignItems: 'center',
//         alignSelf: 'center',
//         marginVertical: 20,
//     },
//     pressable: {
//         width: '100%',
//         height: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     text: {
//         color: '#fff',
//         fontWeight: '600',
//         fontSize: 18,
//     },
// });


const styles = StyleSheet.create({
    circle: {
        marginVertical: 40,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#4A90E2',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { color: '#FFF', fontSize: 42, fontWeight: '800', letterSpacing: 2 },
});
