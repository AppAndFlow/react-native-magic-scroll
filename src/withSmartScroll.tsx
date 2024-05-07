import React from 'react';
import SmartScrollView from './Provider';
import { Provider } from 'jotai';

export const withSmartScroll = (child: () => React.ReactElement) => {
  return () => (
    <Provider>
      <SmartScrollView>{child()}</SmartScrollView>
    </Provider>
  );
};
