import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import Animated, {
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedRef,
  type AnimatedScrollViewProps,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Keyboard,
  TextInput,
  type ScrollViewProps,
  type TextInputProps,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {
  Provider as JotaiProvider,
  useAtom,
  useAtomValue,
  useSetAtom,
} from 'jotai/react';
import { selectAtom } from 'jotai/utils';
import { Platform } from 'react-native';

import { elementsAtom, inputsAtom, wrapperOffsetAtom } from './state';
import { useKeyboard } from './useKeyboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isAndroid = Platform.OS === 'android';

function Wrapper(props: PropsWithChildren<{}>) {
  const setWrapperOffsetAtom = useSetAtom(wrapperOffsetAtom);
  const windowDimensions = useWindowDimensions();
  const { wrapperRef } = useSmartScrollContext();

  return (
    <View
      style={styles.wrapper}
      ref={wrapperRef}
      onLayout={({ nativeEvent }) => {
        if (nativeEvent.layout.height < windowDimensions.height) {
          setWrapperOffsetAtom(
            windowDimensions.height - nativeEvent.layout.height
          );
        }
      }}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

export default function SmartScrollView(props: PropsWithChildren<{}>) {
  return (
    <JotaiProvider>
      <SmartScrollProvider>
        <Wrapper {...props} />
      </SmartScrollProvider>
    </JotaiProvider>
  );
}

const SmartScrollContext = React.createContext<{
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
  isReady: boolean;
  wrapperRef: RefObject<View>;
} | null>(null);

const SmartScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const wrapperRef = React.useRef<View>(null);
  const [isReady, setIsReady] = useState(false);
  const currentFocus = useAtomValue(currentFocusAtom);

  // we have a flick on first focus so we make the scrollview wait a bit before animate
  useLayoutEffect(() => {
    if (currentFocus && !isReady) {
      setTimeout(() => setIsReady(true), isAndroid ? 250 : 100);
    }
  }, [currentFocus]);

  return (
    <SmartScrollContext.Provider
      value={{ scrollRef, scrollY, isReady, wrapperRef }}
    >
      {children}
    </SmartScrollContext.Provider>
  );
};

export const useSmartScrollContext = () => {
  const context = React.useContext(SmartScrollContext);

  if (!context) {
    throw new Error('Plz wrap with SmartScrollProvider');
  }

  return context;
};

function InsideScrollView(
  props: PropsWithChildren<{
    scrollViewProps?: AnimatedScrollViewProps;
    additionalPadding?: number;
  }>
) {
  const { scrollRef } = useSmartScrollContext();
  const { baseScrollViewProps, translateStyle, scrollHandler } =
    useFormSmartScroll({ padding: props?.additionalPadding });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      {...baseScrollViewProps}
      {...props.scrollViewProps}
      onScroll={scrollHandler}
    >
      <Animated.View style={translateStyle}>{props.children}</Animated.View>
    </Animated.ScrollView>
  );
}
export const ScrollView = (
  props: PropsWithChildren<{
    scrollViewProps?: AnimatedScrollViewProps;
    additionalPadding?: number;
  }>
) => {
  return (
    <SmartScrollView>
      <InsideScrollView {...props} />
    </SmartScrollView>
  );
};

const currentFocusAtom = selectAtom(elementsAtom, (val) =>
  Object.keys(val)
    .map((key) => val[key])
    .find((el) => el?.isFocus)
);

export function useFormSmartScroll({
  padding = 0,
}: {
  padding?: number;
} = {}) {
  const insets = useSafeAreaInsets();
  const wrapperOffset = useAtomValue(wrapperOffsetAtom);

  const { isReady, scrollY, scrollRef } = useSmartScrollContext();

  const _keyboard = useKeyboard();

  const setState = useSetAtom(elementsAtom);
  const [inputs, setInputs] = useAtom(inputsAtom);

  const currentFocus = useAtomValue(currentFocusAtom);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const translateY = useSharedValue(0);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardWillHide', () => {
      translateY.value = withTiming(0);
    });

    return () => {
      sub.remove();
    };
  }, []);

  useAnimatedReaction(
    () => currentFocus,
    (focus) => {
      if (!focus) return;

      if (isAndroid) {
        if (
          focus.position + wrapperOffset >
          _keyboard.coordinates.end.screenY - focus.height * 2
        ) {
          if (wrapperOffset) {
            const diff =
              Math.abs(
                _keyboard.coordinates.end.screenY -
                  focus.position -
                  focus.height -
                  padding +
                  scrollY.value -
                  wrapperOffset
              ) + insets.top;
            translateY.value = withTiming(-diff);
            return;
          }

          translateY.value = withTiming(-Math.abs(focus.height / 4));
          return;
        }

        translateY.value = withTiming(0);

        return;
      }

      if (
        focus.position + wrapperOffset >
        _keyboard.coordinates.end.screenY - focus.height + scrollY.value
      ) {
        const diff = Math.abs(
          _keyboard.coordinates.end.screenY -
            focus.position -
            focus.height -
            padding +
            scrollY.value -
            wrapperOffset
        );
        translateY.value = withTiming(-diff);

        return;
      }

      translateY.value = withTiming(0);
    }
  );

  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: isReady ? translateY.value : 0 }],
    };
  }, [currentFocus]);

  const registerInput = useCallback(
    (name: string, ref: RefObject<TextInput>) => {
      if (!inputs[name]) {
        setInputs((s) => ({
          ...s,
          [name]: ref,
        }));
      }
    },
    [setInputs, inputs]
  );

  const chainInput = useCallback(
    (name: string) => {
      const input = inputs[name];

      if (!input) return;

      input.current?.focus();
    },
    [inputs]
  );

  const onFocus = useCallback(
    (name: string) => () => {
      setState((s) => ({
        ...s,
        [name]: {
          height: 0,
          position: 0,
          ...s[name],
          isFocus: true,
          name,
        },
      }));
    },
    [setState]
  );

  const onBlur = useCallback(
    (name: string) => () => {
      setState((s) => ({
        ...s,
        [name]: {
          height: 0,
          position: 0,
          ...s[name],
          isFocus: false,
          name,
        },
      }));
    },
    [setState]
  );

  /**
   * Base props object for the ScrollView|Animated.ScrollView with good props to pass
   */
  const baseScrollViewProps: ScrollViewProps = useMemo(() => {
    return {
      keyboardShouldPersistTaps: 'handled',
    };
  }, []);

  /**
   * Base props object for the TextInput with good props to pass
   */
  const baseTextInputProps = useCallback(
    (
      name: string,
      params: {
        onFocus?: TextInputProps['onFocus'];
        onBlur?: TextInputProps['onBlur'];
      }
    ) => {
      return {
        onFocus: (e) => {
          onFocus(name)();
          params?.onFocus?.(e);
        },
        onBlur: (e) => {
          onBlur(name)();
          params?.onBlur?.(e);
        },
        blurOnSubmit: false,
      } as TextInputProps;
    },
    [onBlur, onFocus]
  );

  return {
    onFocus: (name: string) => onFocus(name)(),
    onBlur: (name: string) => onBlur(name)(),
    registerInput,
    chainInput,
    translateStyle,
    scrollRef,
    baseScrollViewProps,
    baseTextInputProps,
    currentFocus: currentFocus?.name,
    isReady,
    scrollHandler,
  };
}
