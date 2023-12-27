import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type {
  EntryAnimationsValues,
  ExitAnimationsValues,
  LayoutAnimation,
} from 'react-native-reanimated';
import Animated, {
  Easing,
  Extrapolate,
  FadeIn,
  FadeOut,
  Layout,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { PressableScale } from './components/TouchableScale';
import { ActionTray, type ActionTrayRef } from './components/ActionTray';
import { Palette } from './constants/palette';

function App() {
  const ref = useRef<ActionTrayRef>(null);
  const { height: screenHeight } = useWindowDimensions();

  const [step, setStep] = useState(0);

  // Is it really necessary to use a shared value here?
  // I don't know :)
  const isActionTrayOpened = useSharedValue(false);

  // Close the action tray and reset the step
  const close = useCallback(() => {
    ref.current?.close();
    isActionTrayOpened.value = false;
    setStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle the action tray state (open/close)
  const toggleActionTray = useCallback(() => {
    const isActive = ref.current?.isActive() ?? false;
    isActionTrayOpened.value = !isActive;
    isActive ? close() : ref.current?.open();
  }, [close, isActionTrayOpened]);

  const rContentHeight = useDerivedValue(() => {
    // Just a simple interpolation to make the content height dynamic based on the step
    return interpolate(step, [0, 1, 2], [80, 220, 180], Extrapolate.CLAMP);
  }, [step]);

  const rContentStyle = useAnimatedStyle(() => {
    return {
      // Spring animations. Spring animations everywhere! 😅
      height: withSpring(rContentHeight.value, {
        mass: 0.2,
      }),
    };
  }, []);

  // Get the title, action button title and the rotation animation for the action button
  // based on the current step
  const title = useMemo(() => {
    switch (step) {
      case 0:
        return 'How can we help?';
      case 1:
        return 'Choose Areas';
      case 2:
        return 'Other Feedback';
      default:
        return '';
    }
  }, [step]);

  const actionTitle = useMemo(() => {
    switch (step) {
      case 0:
        return 'Continue';
      case 1:
        return 'Accept 1';
      case 2:
        return 'Accept 2';
      default:
        return '';
    }
  }, [step]);

  const rToggleButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Rotate the button when the action tray is opened + -> x
          rotate: withTiming(isActionTrayOpened.value ? '45deg' : '0deg'),
        },
      ],
    };
  }, []);

  // Custom animations when extending height of the action tray
  const CustomExitingAnimation = useCallback(
    (_: ExitAnimationsValues): LayoutAnimation => {
      'worklet';

      const animations = {
        // your animations
        opacity: withTiming(0, {
          easing: Easing.out(Easing.cubic),
          duration: 250,
        }),
        transform: [
          {
            scale: withSpring(1.05, {
              mass: 1,
              damping: 60,
              stiffness: 300,
              overshootClamping: false,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 2,
            }),
          },
        ],
      };
      const initialValues = {
        // initial values for animations
        opacity: 1,
        transform: [{ scale: 1 }],
      };
      // const callback = (finished: boolean) => {
      //   // optional callback that will fire when layout animation ends
      // };
      return {
        initialValues,
        animations,
        // callback,
      };
    },
    [],
  );

  const CustomEnterAnimation = useCallback(
    (_: EntryAnimationsValues): LayoutAnimation => {
      'worklet';

      const animations = {
        // your animations
        opacity: withTiming(1, {
          easing: Easing.out(Easing.cubic),
          duration: 250,
        }),
        transform: [
          {
            scale: withTiming(1, {
              easing: Easing.out(Easing.cubic),
              duration: 200,
            }),
          },
        ],
      };
      const initialValues = {
        // initial values for animations
        opacity: 0,
        transform: [{ scale: 0.9 }],
      };
      // const callback = (finished: boolean) => {
      //   // optional callback that will fire when layout animation ends
      // };
      return {
        initialValues,
        animations,
        // callback,
      };
    },
    [],
  );

  // Custom animations when shortening height of the action tray
  const CustomShrinkEnterAnimation = useCallback(
    (_: EntryAnimationsValues): LayoutAnimation => {
      'worklet';

      const animations = {
        // your animations
        opacity: withTiming(1, {
          easing: Easing.out(Easing.cubic),
          duration: 250,
        }),
        transform: [
          {
            scale: withTiming(1, {
              easing: Easing.out(Easing.cubic),
              duration: 200,
            }),
          },
        ],
      };
      const initialValues = {
        // initial values for animations
        opacity: 0,
        transform: [{ scale: 1.05 }],
      };
      // const callback = (finished: boolean) => {
      //   // optional callback that will fire when layout animation ends
      // };
      return {
        initialValues,
        animations,
        // callback,
      };
    },
    [],
  );

  const CustomShrinkExitingAnimation = useCallback(
    (_: ExitAnimationsValues): LayoutAnimation => {
      'worklet';

      const animations = {
        // your animations
        opacity: withTiming(0, {
          easing: Easing.out(Easing.cubic),
          duration: 200,
        }),
        transform: [
          {
            scale: withSpring(0.9, {
              mass: 1,
              damping: 60,
              stiffness: 300,
              overshootClamping: false,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 2,
            }),
          },
        ],
      };
      const initialValues = {
        // initial values for animations
        opacity: 1,
        transform: [{ scale: 1 }],
      };
      // const callback = (finished: boolean) => {
      //   // optional callback that will fire when layout animation ends
      // };
      return {
        initialValues,
        animations,
        // callback,
      };
    },
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <PressableScale
        style={[styles.button, rToggleButtonStyle]}
        onPress={toggleActionTray}>
        <MaterialCommunityIcons
          name="plus"
          size={25}
          color={Palette.background}
        />
      </PressableScale>

      {/* Reuse this ActionTray whenever you want, you just need to update the children :) */}
      <ActionTray
        ref={ref}
        maxHeight={screenHeight * 0.6}
        style={styles.actionTray}
        onClose={close}>
        {/* All this content is fully customizable, you can use whatever you want here */}
        <View style={styles.headingContainer}>
          <Animated.Text
            exiting={FadeOut.easing(Easing.out(Easing.ease)).duration(150)}
            entering={FadeIn.easing(Easing.out(Easing.ease)).duration(150)}
            style={styles.headingText}
            key={title}>
            {title}
          </Animated.Text>
          <View style={styles.fill} />
          <PressableScale onPress={close} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close-thick"
              size={15}
              color={Palette.text}
            />
          </PressableScale>
        </View>

        <Animated.View style={rContentStyle}>
          {step === 0 && (
            <Animated.Text
              layout={Layout}
              exiting={CustomExitingAnimation}
              style={[styles.contentText, { height: 80 }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut
            </Animated.Text>
          )}
          {step === 1 && (
            <Animated.View
              layout={Layout}
              entering={CustomEnterAnimation}
              exiting={CustomShrinkExitingAnimation}
              style={{ height: 220 }}>
              <Text style={styles.contentText}>
                You know what? I really don't know what to write here.{'\n\n'}I
                just want to make this text long enough to test the animation.
                So I am just typing some random words here.{'\n'}I hope this is
                enough.{'\n\n'}Ultrices gravida dictum fusce ut placerat orci
                nulla pellentesque dignissim.
              </Text>
            </Animated.View>
          )}
          {step === 2 && (
            <Animated.View
              layout={Layout}
              entering={CustomShrinkEnterAnimation}
              exiting={CustomExitingAnimation}
              style={{ height: 180 }}>
              <Text style={styles.contentText}>
                Waaait a second! Actually I have something to say.{'\n\n'}
                If you are reading this, you're probably searching for the
                source code!{'\n\n'}
                If I'm right, you can find it here:{'\n'}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'rgba(0,0,0,0.5)',
                  }}>
                  patreon.com/reactiive
                </Text>
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <PressableScale
          style={styles.continueButton}
          onPress={() => {
            if (step === 2) {
              close();
              return;
            }
            setStep(currentStep => currentStep + 1);
          }}>
          <Text style={styles.buttonText}>{actionTitle}</Text>
        </PressableScale>
      </ActionTray>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: { flex: 1 },
  button: {
    marginTop: 200,
    height: 50,
    backgroundColor: Palette.primary,
    borderRadius: 25,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTray: {
    backgroundColor: '#FFF',
    flex: 1,
    padding: 25,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 25,
    marginBottom: 25,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  headingText: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    height: 24,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentText: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  continueButton: {
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 25,
  },
  buttonText: {
    color: Palette.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export { App };
