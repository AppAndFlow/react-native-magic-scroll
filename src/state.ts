import { atom } from 'jotai';
import type { RefObject } from 'react';
import type { TextInput, View } from 'react-native';
import type Animated from 'react-native-reanimated';

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

export const elementsAtom = atom<Elements>({});
export const wrapperViewRefAtom = atom<View | null>(null);
export const wrapperOffsetAtom = atom(0);
export const inputsAtom = atom<InputType>({});
