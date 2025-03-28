import * as React from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput as RNTextInput } from 'react-native';
import ViewWrapper from './ViewWrapper';
import { useFormSmartScroll } from './Provider';
import type { ViewStyle } from 'react-native';
import { mergeRefs } from './mergeRefs';

type Props = {
  containerStyle?: ViewStyle;
  textInputProps?: TextInputProps;
  name?: string;
  renderTop?: () => React.ReactElement;
  renderBottom?: () => React.ReactElement;
  renderInput?: (
    args: TextInputProps & {
      ref: React.LegacyRef<RNTextInput> | undefined;
    }
  ) => React.ReactElement;
  chainTo?: string;
  ref?: React.RefObject<RNTextInput>;
};

export const TextInput = React.forwardRef<RNTextInput, Props>(
  (props, inputRef) => {
    const id = React.useId();
    const name = React.useRef(props.name ?? id);
    const textInputRef = React.useRef<RNTextInput>(null);

    const ref = mergeRefs([textInputRef, inputRef]);

    const { onBlur, onFocus, onSubmitEditing, ...textInputProps } =
      props.textInputProps ?? {};

    const { registerInput, baseTextInputProps, chainInput } =
      useFormSmartScroll();

    React.useEffect(() => {
      registerInput(name.current, textInputRef);
    }, []);

    return (
      <ViewWrapper name={name.current} style={props.containerStyle}>
        {typeof props.renderInput === 'function' ? (
          props.renderInput({
            ...(textInputProps ?? {}),
            onSubmitEditing: (e) => {
              if (props.chainTo) {
                chainInput(props.chainTo);
              }

              onSubmitEditing?.(e);
            },
            ...baseTextInputProps(name.current, {
              onFocus,
              onBlur,
            }),
            ref,
          })
        ) : (
          <>
            {props.renderTop?.()}
            <RNTextInput
              ref={ref}
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
          </>
        )}
      </ViewWrapper>
    );
  }
);
