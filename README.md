![image](https://cdn.discordapp.com/attachments/1233084704295751750/1252345604571398288/Github_Banner.png?ex=6671e13b&is=66708fbb&hm=ff3de0eb88407a5f8b0092333786004907aeb3f3369ea593e3eb3d77ee25e599&)

### About
App & Flow is a Montreal-based, close-knit team that specializes in React Native and Expo development. We work with multiple YC-backed startups and are recommended by [Expo](https://expo.dev/consultants). Need a hand? Let’s build together. team@appandflow.com

[![npm (scoped)](https://img.shields.io/npm/v/@appandflow/react-native-magic-scroll.svg)](https://www.npmjs.com/package/@appandflow/react-native-magic-scroll)

## Why react-native-magic-scroll?
The goal of the library is to seamlessly and precisely handle your keyboard, scrollview and inputs when interacting with forms. While other solutions offer plug-and-play functionalities, we wanted to have something more precise and with more flexibility so that it can be used in any situation.

### Examples
We recreated two flows from popular apps to showcase our library in action.
The demo app code is available [here](https://github.com/AppAndFlow/react-native-magic-scroll-demo).

| Twitch's sign up  | Shop's check out |
| ------------- | ------------- |
| <video src="https://github.com/AppAndFlow/react-native-magic-scroll-demo/assets/129197567/c1e2b9f4-f66d-4aaf-a57d-9eb4b89400e9">  | <video src="https://github.com/AppAndFlow/react-native-magic-scroll-demo/assets/129197567/4d1a23f2-c55e-414f-a564-4883dfc2c3aa">|

## Installation

### react-native-magic-scroll

```sh
yarn install @appandflow/react-native-magic-scroll
```

```sh
npm i @appandflow/react-native-magic-scroll
```

### Dependencies

To use our library, you will need to install these two dependencies into your project.

**1) React Native Reanimated**

```sh
npx expo install react-native-reanimated
```

Learn more about this dependency [here](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).

**2) SafeAreaContext**

```sh
npx expo install react-native-safe-area-context
```

Learn more about this dependency [here](https://docs.expo.dev/versions/latest/sdk/safe-area-context/).

### Android

On Android, make sure to set `android:windowSoftInputMode` in your `AndroidManifest.xml` to **pan**

#### Expo

```
// app.json
"android": {
  ...rest,
  "softwareKeyboardLayoutMode": "pan"
}
```



## Basic Usage

Wrap your screen within our ScrollView.

```tsx
import { MagicScroll } from '@appandflow/react-native-magic-scroll';
// rest of your imports

const YourScreen = () => {
  return (
    <MagicScroll.ScrollView>
      // Your form
    </MagicScroll.ScrollView>
  );
};

export default YourScreen;
```

You then use our TextInputs for the form itself, that you place inside the MagicScroll.ScrollView. Easily "chain" your inputs (so that the return keyboard button hops to the next desired input) by using the MagicScroll.TextInput `name` and `chainTo` props, like so:

```tsx
import { MagicScroll } from '@appandflow/react-native-magic-scroll';
// rest of your imports

const textInputStyle = {
  height: 50,
  backgroundColor: '#ddd',
  borderRadius: 10,
  marginTop: 8,
};


const YourScreen = () => {
  return (
    <MagicScroll.ScrollView>
      <MagicScroll.TextInput
        // This is the name of this text input, used by the `chainTo` prop
        name="email"
        // This is where you can design your a custom label above the input
        renderTop={() => <Text>Email</Text>}
        // This is where you can design your custom label below the input
        renderBottom={() => <Text>Must be unique</Text>}
        // This is the function that will make the text input named "password" focused when pressing the Enter or Return key on the device's keyboard
        chainTo="password"
        textInputProps={{
          style: textInputStyle,
        }}
      />
      <MagicScroll.TextInput
        name="password"
        renderTop={() => <Text>Password</Text>}
        textInputProps={{
          secureTextEntry: true,
          style: textInputStyle,
        }}
      />
    </MagicScroll.ScrollView>
  );
};
```

## Advanced

As mentioned in the introduction, the drawbacks of a plug-and-play library are its limitations when deviating from standard functionality. That's precisely why our library allows for customization, enabling you to tailor its usage to suit your specific needs and use cases.

## Tips

It's a great idea to wrap our MagicScroll.TextInput within your own for re-usability!

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
      chainTo={props.chainTo}
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

## Props (Optional)
All of these props are optional. It is, however, recommended to use them to get the most out of the library. 

#### MagicScroll.ScrollView:

| Name | Description | Values |
| ---- | ----------- | ------ |
| additionalPadding | adds extra padding between your text input and the keyboard | number |
| scrollViewProps | contains all props of the scrollview from React's Reanimated library | [props](https://reactnative.dev/docs/scrollview#props) |

#### MagicScroll.TextInput:

| Name | Description | Values |
| ---- | ----------- | ------ |
| chainTo | a string containing the name of the next text input that will be focused when pressing the "Enter Key" | string |
| containerStyle | contains all Style props of the View from React Native | [props](https://reactnative.dev/docs/view-style-props) |
| name | a string to name the current text input, used in the "chainTo" props mentionned above | string |
| renderBottom() | a function that renders components to display custom text under the text input | ```renderBottom={() => <Text>bottomText</Text>}``` |
| renderTop() | a function that renders components to display custom text above the text input | ```renderTop={() => <Text>topText</Text>}``` |
| textInputProps | contains all props of the TextInput component from React Native  | [props](https://reactnative.dev/docs/textinput#props) |

