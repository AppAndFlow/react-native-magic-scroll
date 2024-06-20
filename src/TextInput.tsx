import * as React from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput as RNTextInput } from 'react-native';
import ViewWrapper from './ViewWrapper';
import { useFormSmartScroll } from './Provider';
import type { ViewStyle } from 'react-native';

type Props = {
  containerStyle?: ViewStyle;
  textInputProps?: TextInputProps;
  name?: string;
  renderTop?: () => React.ReactElement;
  renderBottom?: () => React.ReactElement;
  chainTo?: string;
};

export const TextInput = (props: Props) => {
  const id = React.useId();
  const name = React.useRef(props.name ?? id);
  const textInputRef = React.useRef<RNTextInput>(null);

  const { onBlur, onFocus, onSubmitEditing, ...textInputProps } =
    props.textInputProps ?? {};

  const { registerInput, baseTextInputProps, chainInput } =
    useFormSmartScroll();

  React.useEffect(() => {
    registerInput(name.current, textInputRef);
  }, []);

  return (
    <ViewWrapper name={name.current} style={props.containerStyle}>
      {props.renderTop?.()}
      <RNTextInput
        ref={textInputRef}
        {...baseTextInputProps(name.current, { onFocus, onBlur })}
        {...textInputProps}
        onSubmitEditing={(e) => {
          if (props.chainTo) {
            chainInput(props.chainTo);
          }

          onSubmitEditing?.(e);
        }}
      />
      {props.renderBottom?.()}
    </ViewWrapper>
  );
};
