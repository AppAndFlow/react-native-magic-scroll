![image](https://cdn.discordapp.com/attachments/1233084704295751750/1252345604571398288/Github_Banner.png?ex=6671e13b&is=66708fbb&hm=ff3de0eb88407a5f8b0092333786004907aeb3f3369ea593e3eb3d77ee25e599&)

[![npm (scoped)](https://img.shields.io/npm/v/@appandflow/rn-magic-scroll.svg)](https://www.npmjs.com/package/@appandflow/rn-magic-scroll)

The objective of the library is to ease the discomfort of scrolling by implementing keyboard management for user input. While another solution offered plug-and-play functionality, we opted against it because it lacked the flexibility to address issues as they arise. We believe our approach will empower you to resolve any challenges your app may encounter.

We re-implemented two flows from existing apps to showcase our library.

| Twitch's sign up  | Shop's check out |
| ------------- | ------------- |
| <video src="https://github.com/AppAndFlow/react-native-magic-scroll-demo/assets/129197567/c1e2b9f4-f66d-4aaf-a57d-9eb4b89400e9">  | <video src="https://github.com/AppAndFlow/react-native-magic-scroll-demo/assets/129197567/4d1a23f2-c55e-414f-a564-4883dfc2c3aa">|

## Installation

### Dependencies

To use our library, you will need to install these two dependencies into your project.

**1) React Native Reanimated**

`npx expo install react-native-reanimated`

Learn more about this dependency [here](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).

**2) SafeAreaContext**

`npx expo install react-native-safe-area-context`

Learn more about this dependency [here](https://docs.expo.dev/versions/latest/sdk/safe-area-context/).

### react-native-magic-scroll

```sh
yarn install @appandflow/react-native-magic-scroll
```

```sh
npm i @appandflow/react-native-magic-scroll
```

### Android

On Android, make sure to set `android:windowSoftInputMode` in your `AndroidManifest.xml` to **pan**

##### Expo

```
// app.json
"android": {
  ...rest,
  "softwareKeyboardLayoutMode": "pan"
}
```



## Basic Usage

Wrap your form/screen within our ScrollView. Utilizing context requires it to be one level higher for enhanced control over your inputs, or alternatively, you can employ the Higher Order Component (HOC) for this purpose.

```tsx
import { MagicScroll } from '@appandflow/react-native-magic-scroll';

// rest of your imports

const YourScreen = () => {
  return (
    <MagicScroll.ScrollView>
      <YourForm />
    </MagicScroll.ScrollView>
  );
};

export default YourScreen;
```

Then inside your form/component where you can use our TextInput.

```tsx
import { MagicScroll } from '@appandflow/react-native-magic-scroll';

// rest of your imports

const YourForm = () => {
  return (
    <View>
      <MagicScroll.TextInput
        // This is the name of this text input
        name="email"
        // This is where you can design your custom label
        renderTop={() => <Text>Email</Text>}
        // This is where you can add descriptive text under the text input
        renderBottom={() => <Text>Must be unique</Text>}
        // This is the function that will make the text input named "password" focused when pressing the Enter key on the device's keyboard
        chainable="password"
        textInputProps={{
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 10,
            marginTop: 8,
          },
        }}
      />
      <MagicScroll.TextInput
        name="password"
        renderTop={() => <Text>Password</Text>}
        textInputProps={{
          secureTextEntry: true,
          style: {
            height: 50,
            backgroundColor: '#ddd',
            borderRadius: 10,
            marginTop: 8,
          },
        }}
      />
    </View>
  );
};
```

## Advance usage

As mentioned in the introduction, the drawback of a plug-and-play library lies in its limitations when deviating from standard functionality. That's precisely why our library allows for customization, enabling you to tailor its usage to suit your specific needs and use cases.

## Tips

We encourage you to wrap our TextInput with your custom one.

Here's an example

```tsx
import { MagicScroll } from '@appandflow/react-native-magic-scroll';

// rest of your imports

interface Props {
  label?: string;
  isPassword?: boolean;
  name?: string;
  description?: string;
  chainTo?: string;
}

const YourCustomInput = (props: Props) => {
  return (
    <MagicScroll.TextInput
      name={props.name}
      chainable={props.chainTo}
      renderTop={() => <Text>{props.label}</Text>}
      renderBottom={() => <Text>{props.description}</Text>}
      textInputProps={{
        secureTextEntry: props.isPassword,
        style: {
          height: 50,
          backgroundColor: '#ddd',
          borderRadius: 10,
          marginTop: 8,
        },
      }}
    />
  );
};
```

## Props

Scrollview props: 

| Name | Description | Values |
| ---- | ----------- | ------ |
| additionalPadding | adds extra padding between your text input and the keyboard | number |
| scrollViewProps | contains all props of the scrollview from React's Reanimated library | |

Text Input props:

| Name | Description | Values |
| ---- | ----------- | ------ |
| chainable | a string containing the name of the next text input that will be focused when pressing the "Enter Key" | string |
| containerStyle | contains all Style props of the View from React Native | |
| name | a string to name the current text input, used in the "chainable" props mentionned above | string |
| renderBottom() | a function that renders components to display custom text under the text input | ```renderBottom={() => <Text>bottomText</Text>}``` |
| renderTop() | a function that renders components to display custom text above the text input | ```renderTop={() => <Text>topText</Text>}``` |
| textInputProps | contains all props of the TextInput component from React Native  | [props](https://reactnative.dev/docs/textinput#props) |

