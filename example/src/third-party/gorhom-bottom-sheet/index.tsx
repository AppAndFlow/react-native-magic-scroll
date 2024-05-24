import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { MagicScroll } from '../../../../src';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Form = () => {
  const insets = useSafeAreaInsets();

  return (
    <MagicScroll.ScrollView
      scollViewProps={{
        contentContainerStyle: {
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 20,
          backgroundColor: 'red',
          paddingTop: 100,
        },
        style: { backgroundColor: 'blue' },
      }}
    >
      <MagicScroll.TextInput
        name="username"
        textInputProps={{
          placeholder: 'Username',
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 6,
            paddingHorizontal: 16,
          },
        }}
      />
      <MagicScroll.TextInput
        name="first_name"
        containerStyle={{ marginTop: 8 }}
        textInputProps={{
          placeholder: 'First Name',
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 6,
            paddingHorizontal: 16,
          },
        }}
      />
      <MagicScroll.TextInput
        name="last_name"
        containerStyle={{ marginTop: 8 }}
        textInputProps={{
          placeholder: 'Last Name',
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 6,
            paddingHorizontal: 16,
          },
        }}
      />
      <MagicScroll.TextInput
        name="email"
        containerStyle={{ marginTop: 8 }}
        textInputProps={{
          placeholder: 'Email',
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 6,
            paddingHorizontal: 16,
          },
        }}
      />
      <MagicScroll.TextInput
        name="password"
        containerStyle={{ marginTop: 8 }}
        textInputProps={{
          placeholder: 'Password',
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 6,
            paddingHorizontal: 16,
          },
        }}
      />
    </MagicScroll.ScrollView>
  );
};

const Example = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['25%', '80%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        onPress={handlePresentModalPress}
        title="Present Modal"
        color="black"
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        backdropComponent={renderBackdrop}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={[styles.contentContainer]}>
          <MagicScroll.SmartScrollView>
            <Form />
          </MagicScroll.SmartScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    minHeight: 100,
  },
});

export const GorhomBottomSheetExample = () => (
  <BottomSheetModalProvider>
    <Example />
  </BottomSheetModalProvider>
);
