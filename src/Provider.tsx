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
  withDelay,
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
import { Platform } from 'react-native';

import { useKeyboard } from './useKeyboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrientation } from './useOrientation';

export type RefType = TextInput | View | Animated.View | null;

export type Elements = Record<
  string,
  {
    isFocus: boolean;
    position: number;
    height: number;
    name: string;
  }
>;

export type InputType = Record<string, RefObject<TextInput>>;

const isAndroid = Platform.OS === 'android';

function Wrapper(props: PropsWithChildren<{}>) {
  const windowDimensions = useWindowDimensions();
  const { wrapperRef, setWrapperOffset } = useSmartScrollContext();

  return (
    <View
      style={styles.wrapper}
      ref={wrapperRef}
      onLayout={({ nativeEvent }) => {
        if (nativeEvent.layout.height !== windowDimensions.height) {
          setWrapperOffset(windowDimensions.height - nativeEvent.layout.height);
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
    <SmartScrollProvider>
      <Wrapper {...props} />
    </SmartScrollProvider>
  );
}

const SmartScrollContext = React.createContext<{
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
  isReady: boolean;
  wrapperRef: RefObject<View>;
  wrapperOffset: number;
  setWrapperOffset: React.Dispatch<React.SetStateAction<number>>;
  elements: Elements;
  setElements: React.Dispatch<React.SetStateAction<Elements>>;
  inputs: InputType;
  setInputs: React.Dispatch<React.SetStateAction<InputType>>;
  currentFocus?: null | Elements[0];
  clearFocus: () => void;
} | null>(null);

const SmartScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const wrapperRef = React.useRef<View>(null);
  const [isReady, setIsReady] = useState(false);
  const [elements, setElements] = useState<Elements>({});
  const [wrapperOffset, setWrapperOffset] = useState(0);
  const [inputs, setInputs] = useState<InputType>({});

  const currentFocus = useMemo(
    () =>
      Object.keys(elements)
        .map((key) => elements[key])
        .find((el) => el?.isFocus),
    [elements]
  );

  const clearFocus = useCallback(() => {
    if (!currentFocus) return;

    setElements((els) => ({
      ...els,
      [currentFocus.name]: {
        ...currentFocus,
        isFocus: false,
      },
    }));
  }, [elements, currentFocus]);

  // we have a flick on first focus so we make the scrollview wait a bit before animate
  useLayoutEffect(() => {
    if (currentFocus && !isReady) {
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    }
  }, [currentFocus]);

  return (
    <SmartScrollContext.Provider
      value={{
        scrollRef,
        scrollY,
        isReady,
        wrapperRef,
        wrapperOffset,
        setWrapperOffset,
        elements,
        setElements,
        currentFocus,
        inputs,
        setInputs,
        clearFocus,
      }}
    >
      {children}
    </SmartScrollContext.Provider>
  );
};

export const useSmartScrollContext = () => {
  const context = React.useContext(SmartScrollContext);

  if (!context) {
    throw new Error(
      'Component must be wrapped in a SmartScrollProvider. Please ensure the provider is included.'
    );
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

export function useFormSmartScroll({
  padding = 0,
}: {
  padding?: number;
} = {}) {
  const insets = useSafeAreaInsets();
  const {
    currentFocus,
    setElements,
    isReady,
    scrollY,
    scrollRef,
    wrapperOffset,
    inputs,
    setInputs,
    clearFocus,
  } = useSmartScrollContext();

  const _keyboard = useKeyboard();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const translateY = useSharedValue(0);

  const orientation = useOrientation();

  const keyboardEnd = _keyboard.coordinates.end.screenY;

  useEffect(() => {
    translateY.value = 0;
    scrollY.value = 0;
    clearFocus();
    Keyboard.dismiss();
  }, [orientation]);

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
        if (focus.position + wrapperOffset > keyboardEnd - focus.height * 2) {
          if (wrapperOffset) {
            const diff =
              Math.abs(
                keyboardEnd -
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
        keyboardEnd - focus.height + scrollY.value
      ) {
        const diff = Math.abs(
          keyboardEnd -
            focus.position -
            focus.height -
            padding +
            scrollY.value -
            wrapperOffset -
            insets.bottom
        );
        translateY.value = withTiming(-diff);

        return;
      }

      translateY.value = withTiming(0);
    }
  );

  const translateStyle = useAnimatedStyle(() => {
    if (!isReady && currentFocus) {
      // On first focus, delay the animation with native driver
      return {
        transform: [
          {
            translateY: withDelay(
              Platform.OS === 'android' ? 150 : 16,
              withTiming(translateY.value)
            ),
          },
        ],
      };
    }

    return {
      transform: [{ translateY: translateY.value }],
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
      setElements((s) => ({
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
    [setElements]
  );

  const onBlur = useCallback(
    (name: string) => () => {
      setElements((s) => ({
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
    [setElements]
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
