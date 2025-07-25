// app/components/TimerButton.jsx
import React, { useRef } from 'react';
import { Pressable, Animated, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TimerButton({ isTracking, running, disabled, onToggle }) {
    const scale = useRef(new Animated.Value(1)).current;

    const animate = (to) =>
        Animated.spring(scale, { toValue: to, useNativeDriver: true }).start();

    return (
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={18}
                reducedTransparencyFallbackColor="white"
            />
            <View style={styles.glassOverlay} />
            <Pressable
                onPressIn={() => animate(0.93)}
                onPressOut={() => animate(1)}
                onPress={onToggle}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && { opacity: 0.7 },
                ]}
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

const styles = StyleSheet.create({
    circle: {
        marginVertical: 40,
        width: 220,
        height: 220,
        borderRadius: 110,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        elevation: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 110,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    pressable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.12)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
});