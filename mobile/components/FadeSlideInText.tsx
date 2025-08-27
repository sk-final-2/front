import React, { useEffect, useRef } from 'react';
import { Animated, Easing, TextStyle } from 'react-native';

function FadeSlideInText({
  children,
  delay = 0,
  triggerKey = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  triggerKey?: number;
  style?: TextStyle | TextStyle[];
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    // 매번 새로 재생: 값 초기화 후 타이밍 시작
    opacity.setValue(0);
    translateY.setValue(8);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 550,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 550,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [triggerKey, delay, opacity, translateY]);

  return (
    <Animated.Text style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.Text>
  );
}

export default FadeSlideInText;