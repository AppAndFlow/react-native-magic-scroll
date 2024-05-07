import React from 'react';
import SmartScrollView from './Provider';
import { Provider } from 'jotai';

export const withSmartScroll = (child: (props?: any) => React.ReactElement) => {
  return (props?: any) => (
    <Provider>
      <SmartScrollView>{child(props)}</SmartScrollView>
    </Provider>
  );
};
