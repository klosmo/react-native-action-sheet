import type { StyleProp, ViewStyle } from 'react-native';
import { Dimensions, StyleSheet } from 'react-native';
import React, { useCallback, useImperativeHandle } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { WithSpringConfig } from 'react-native-reanimated';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Backdrop } from './Backdrop';

const OVERDRAG = 20; // Amount of overdrag allowed

// Get the screen height
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the props for the ActionTray component
type ActionTrayProps = {
  children?: React.ReactNode;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  onClose?: () => void;
};

export type ActionTrayRef = {
  open: () => void;
  isActive: () => boolean;
  close: () => void;
};

// Create the ActionTray component
const ActionTray = React.forwardRef<ActionTrayRef, ActionTrayProps>(
  ({ children, style, maxHeight = SCREEN_HEIGHT, onClose }, ref) => {
    // Create a shared value for translateY animation
    const translateY = useSharedValue(maxHeight);

    // Define the maximum translateY value for the ActionTray
    const MAX_TRANSLATE_Y = -maxHeight;

    // Create a shared value to track the active state
    const active = useSharedValue(false);

    // Function to scroll to a specific Y position
    const scrollTo = useCallback(
      (destination: number, config?: WithSpringConfig) => {
        'worklet';
        active.value = destination !== maxHeight;

        translateY.value = withSpring(
          destination,
          config ?? {
            mass: 0.1,
          },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [],
    );

    // Function to close the ActionTray
    const close = useCallback(() => {
      'worklet';
      return scrollTo(maxHeight, {
        mass: 0.3,
      });
    }, [maxHeight, scrollTo]);

    // Expose functions and values through useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        close,
        open: () => {
          'worklet';
          scrollTo(0);
        },
        isActive: () => {
          return active.value;
        },
      }),
      [close, scrollTo, active.value],
    );

    // Create a shared value for context
    const context = useSharedValue({ y: 0 });

    // Create a gesture handler for pan gestures
    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate(event => {
        const offsetDelta = context.value.y + event.translationY;

        const clamp = Math.max(-OVERDRAG, offsetDelta);

        // create a smooth resistance effect when overdragging
        const overdragStop = offsetDelta / 20;

        if (event.translationY < 0) {
          // Drag up
          translateY.value =
            overdragStop <= clamp
              ? withSpring(clamp, { mass: 0.5 })
              : overdragStop;
        } else {
          // Drag down
          translateY.value = offsetDelta;
        }
      })
      .onEnd(event => {
        if (event.translationY > 100) {
          // Close the Action Tray when the user swipes down
          if (onClose) {
            runOnJS(onClose)();
          } else close();
        } else {
          // Restore to the previous position if the users doesn't swipe down enough
          scrollTo(context.value.y);
        }
      });

    // Create an animated style for the bottom sheet
    const rActionTrayStyle = useAnimatedStyle(() => {
      // Interpolate the borderRadius based on translateY value
      const borderRadius = interpolate(
        translateY.value,
        [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
        [25, 5],
        Extrapolate.CLAMP,
      );

      return {
        borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    });

    // Render the ActionTray component
    return (
      <>
        {/* Backdrop to handle tap events */}
        {/* <Backdrop onTap={onClose ?? close} isActive={active} /> */}
        <Backdrop onTap={() => {}} isActive={active} />
        {/* Gesture detector to handle pan gestures */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.actionTrayContainer, rActionTrayStyle, style]}>
            <Animated.View>{children}</Animated.View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  },
);

// Define the styles for the ActionTray component
const styles = StyleSheet.create({
  actionTrayContainer: {
    backgroundColor: '#FFF',
    width: '95%',
    position: 'absolute',
    bottom: 30,
    borderCurve: 'continuous',
    alignSelf: 'center',
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
  fill: { flex: 1 },
});

export { ActionTray };
