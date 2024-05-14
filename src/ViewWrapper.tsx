import type { PropsWithChildren } from 'react';
import React, { useRef } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useAtom, useAtomValue } from 'jotai';
import { elementsAtom, mainViewRefAtom } from './state';

type Props = PropsWithChildren<{
  name: string;
  style?: ViewStyle;
}>;

const ViewWrapper = ({ name, style, children }: Props) => {
  const mainViewRef = useAtomValue(mainViewRefAtom);
  const [state, setState] = useAtom(elementsAtom);

  const ref = useRef<View>(null);

  return (
    <View
      ref={ref}
      style={style}
      onLayout={({ nativeEvent }) => {
        const element = state[name];
        if (mainViewRef && !state[name]) {
          ref.current?.measureLayout(mainViewRef, (_, y, _w, h) => {
            setState((s) => ({
              ...s,
              [name]: {
                ...s[name],
                isFocus: false,
                position: y,
                height: h,
                name: name,
              },
            }));
          });
        } else if (element) {
          setState({
            ...state,
            [name]: {
              ...element,
              height: nativeEvent.layout.height,
            },
          });
        }
      }}
    >
      {children}
    </View>
  );
};

export default ViewWrapper;
