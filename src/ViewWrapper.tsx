import type { PropsWithChildren } from 'react';
import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { useSmartScrollContext } from './Provider';

type Props = PropsWithChildren<{
  name: string;
  style?: ViewStyle;
}>;

const ViewWrapper = ({ name, style, children }: Props) => {
  const { wrapperRef, elements, setElements } = useSmartScrollContext();

  const ref = useRef<View>(null);

  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const element = elements[name];
      if (wrapperRef.current && !elements[name]) {
        ref.current?.measureLayout(wrapperRef.current, (_, y, _w, h) => {
          setElements((s) => ({
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
        setElements((s) => ({
          ...s,
          [name]: {
            ...element,
            height: nativeEvent.layout.height,
          },
        }));
      }
    },
    [name, wrapperRef, elements]
  );

  return (
    <View ref={ref} style={style} collapsable onLayout={onLayout}>
      {children}
    </View>
  );
};

export default ViewWrapper;
