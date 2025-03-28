import React from 'react';
import SmartScrollView from './Provider';

export const withSmartScroll = (child: (props?: any) => React.ReactElement) => {
  return (props?: any) => <SmartScrollView>{child(props)}</SmartScrollView>;
};
