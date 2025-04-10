import { useEffect, useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export function useOrientation(): ScreenOrientation.Orientation {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.PORTRAIT_UP
  );

  const getInitialOrientation = async () => {
    const initial = await ScreenOrientation.getOrientationAsync();

    setOrientation(initial);
  };

  useEffect(() => {
    getInitialOrientation();
  }, []);

  useEffect(() => {
    const listener = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(listener);
    };
  }, []);

  return orientation;
}
