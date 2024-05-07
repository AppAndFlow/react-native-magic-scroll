import { useState, type RefObject, useCallback, useMemo } from 'react';
import type { TextInput, View } from 'react-native';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useKeyboard } from './useKeyboard';
import AnimatedView from 'react-native-reanimated';
import type { ScrollViewProps } from 'react-native';
import type { TextInputProps } from 'react-native';

interface FormType {
  [name: string]: any;
}

interface Props {
  padding?: number;
}

export type RefType = TextInput | View | AnimatedView.View | null;

export const useFormSmartScroll = <T extends FormType>({
  padding = 0,
}: Props = {}) => {
  const scrollY = useSharedValue(0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const _keyboard = useKeyboard();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  type Elements = {
    [key in keyof T]: {
      isFocus: boolean;
      position: number;
      height: number;
      ref: RefObject<RefType>;
    };
  };

  type Inputs = {
    [key in keyof T]: RefObject<TextInput>;
  };

  const [state, setState] = useState<Elements>({} as Elements);
  const [inputs, setInputs] = useState<Inputs>({} as Inputs);

  const translateStyle = useAnimatedStyle(() => {
    const currentFocus = Object.keys(state)
      .map((key) => state[key])
      .find((el) => el?.isFocus);

    function value(): number {
      if (!currentFocus) return 0;

      if (
        currentFocus.position >
        _keyboard.coordinates.end.screenY - 80 + scrollY.value
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

  const registerElement = (name: keyof T) => (ref: RefType) => {
    if (!state[name]) {
      ref?.measureInWindow((_, y, _w, h) => {
        setState((s) => ({
          ...s,
          [name]: {
            isFocus: false,
            position: y,
            height: h,
          },
        }));
      });
    }
  };

  const registerInput =
    (name: keyof T) => (ref: RefObject<TextInput | null>) => {
      if (!inputs[name]) {
        setInputs((s) => ({
          ...s,
          [name]: ref,
        }));
      }
    };

  const chainInput = useCallback(
    (name: keyof T) => {
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
    (name: keyof T) => () => {
      setState((s) => ({
        ...s,
        [name]: {
          ...s[name],
          isFocus: true,
        },
      }));
    },
    []
  );

  const onBlur = useCallback(
    (name: keyof T) => () => {
      setState((s) => ({
        ...s,
        [name]: {
          ...s[name],
          isFocus: false,
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
    (name: keyof T) => {
      return {
        onFocus: onFocus(name),
        onBlur: onBlur(name),
        blurOnSubmit: false,
      } as TextInputProps;
    },
    [onBlur, onFocus]
  );

  return {
    onFocus,
    onBlur,
    registerElement,
    registerInput,
    chainInput,
    translateStyle,
    scrollHandler,
    scrollRef,
    baseScrollViewProps,
    baseTextInputProps,
  };
};
