import type { PropsWithChildren } from 'react';
import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useAtom } from 'jotai';
import { elementsAtom } from './state';
import { useSmartScrollContext } from './Provider';

type Props = PropsWithChildren<{
  name: string;
  style?: ViewStyle;
}>;

const ViewWrapper = ({ name, style, children }: Props) => {
  const [state, setState] = useAtom(elementsAtom);
  const { wrapperRef } = useSmartScrollContext();

  const ref = useRef<View>(null);

  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const element = state[name];
      if (wrapperRef.current && !state[name]) {
        ref.current?.measureLayout(wrapperRef.current, (_, y, _w, h) => {
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
    },
    [state, name, wrapperRef]
  );

  return (
    <View ref={ref} style={style} collapsable onLayout={onLayout}>
      {children}
    </View>
  );
};

export default ViewWrapper;
