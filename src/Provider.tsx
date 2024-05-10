import React, {
  useCallback,
  useMemo,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import {
  TextInput,
  type ScrollViewProps,
  type TextInputProps,
  View,
  StyleSheet,
} from 'react-native';
import { Provider, useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import { selectAtom } from 'jotai/utils';
import { Platform } from 'react-native';

import { elementsAtom, inputsAtom, mainViewRefAtom } from './state';
import { useKeyboard } from './useKeyboard';

const isAndroid = Platform.OS === 'android';

function Wrapper(props: PropsWithChildren<{}>) {
  const setMainViewRefAtom = useSetAtom(mainViewRefAtom);

  return (
    <View style={styles.wrapper} ref={setMainViewRefAtom}>
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
    <Provider>
      <Wrapper {...props} />
    </Provider>
  );
}

export function ScrollView(
  props: PropsWithChildren<{
    scollViewProps?: AnimatedScrollViewProps;
    additionalPadding?: number;
  }>
) {
  const { scrollHandler, scrollRef, baseScrollViewProps, translateStyle } =
    useFormSmartScroll({ padding: props?.additionalPadding });

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      ref={scrollRef}
      {...baseScrollViewProps}
      {...props.scollViewProps}
    >
      <Animated.View style={translateStyle}>{props.children}</Animated.View>
    </Animated.ScrollView>
  );
}

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
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const _keyboard = useKeyboard();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const setState = useSetAtom(elementsAtom);
  const [inputs, setInputs] = useAtom(inputsAtom);

  const currentFocus = useAtomValue(currentFocusAtom);

  const translateStyle = useAnimatedStyle(() => {
    function value(): number {
      if (!currentFocus) return 0;

      if (isAndroid) {
        if (
          currentFocus.position >
          _keyboard.coordinates.end.screenY - currentFocus.height * 2
        ) {
          return -Math.abs(currentFocus.height / 4);
        }

        return 0;
      }

      if (
        currentFocus.position >
        _keyboard.coordinates.end.screenY - currentFocus.height + scrollY.value
      ) {
        const diff = Math.abs(
          _keyboard.coordinates.end.screenY -
            currentFocus.position -
            currentFocus.height -
            padding +
            scrollY.value
        );

        return -diff;
      }

      return 0;
    }

    return {
      transform: [{ translateY: withTiming(value()) }],
    };
  });

  const registerInput = useCallback(
    (name: string, ref: RefObject<TextInput>) => {
      if (!inputs[name]) {
        setInputs((s) => ({
          ...s,
          [name]: ref,
        }));
      }
    },
    []
  );

  const chainInput = useCallback(
    (name: string) => {
      const input = inputs[name];

      if (!input) return;

      input.current?.focus();
    },
    [inputs]
  );

  useDerivedValue(() => {
    scrollTo(scrollRef, 0, scrollY.value, true);
  });

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
    []
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
    []
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
        onFocus: TextInputProps['onFocus'];
        onBlur: TextInputProps['onBlur'];
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
    scrollHandler,
    scrollRef,
    baseScrollViewProps,
    baseTextInputProps,
    currentFocus: currentFocus?.name,
  };
}
