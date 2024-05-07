import { useEffect, useState } from 'react';
import {
  Keyboard,
  type KeyboardEventListener,
  type KeyboardMetrics,
} from 'react-native';

const emptyCoordinates = Object.freeze({
  screenX: 0,
  screenY: 0,
  width: 0,
  height: 0,
});

const initialValue = {
  start: emptyCoordinates,
  end: emptyCoordinates,
};

export function useKeyboard() {
  const [shown, setShown] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    start: undefined | KeyboardMetrics;
    end: KeyboardMetrics;
  }>(initialValue);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const handleKeyboardWillShow: KeyboardEventListener = (event) => {
    setCoordinates({
      start: event.startCoordinates,
      end: event.endCoordinates,
    });
  };

  const handleKeyboardDidShow: KeyboardEventListener = (event) => {
    setShown(true);
    setCoordinates({
      start: event.startCoordinates,
      end: event.endCoordinates,
    });
    setKeyboardHeight(event.endCoordinates.height);
  };

  const handleKeyboardWillHide: KeyboardEventListener = (event) => {
    setCoordinates({
      start: event.startCoordinates,
      end: event.endCoordinates,
    });
  };

  const handleKeyboardDidHide: KeyboardEventListener = (event) => {
    setShown(false);
    if (event) {
      setCoordinates({
        start: event.startCoordinates,
        end: event.endCoordinates,
      });
    } else {
      setCoordinates(initialValue);
      setKeyboardHeight(0);
    }
  };

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow),
      Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow),
      Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide),
      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  return {
    keyboardShown: shown,
    coordinates,
    keyboardHeight,
  };
}
