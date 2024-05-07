The objective of the library is to ease the discomfort of scrolling by implementing keyboard management for user input. While another solution offered plug-and-play functionality, we opted against it because it lacked the flexibility to address issues when they arise. We believe our approach will empower you to resolve any challenges your app may encounter.

## Installation

```sh
yarn install @appandflow/rn-magic-scroll
```

```sh
npm i @appandflow/rn-magic-scroll
```

## Basic Usage

Wrap your form/screen within our ScrollView. Utilizing context requires it to be one level higher for enhanced control over your inputs. Alternatively, you can employ the Higher Order Component (HOC) for this purpose.

```tsx
import MagicScroll from '@appandflow/rn-magic-scroll';

// rest of your imports

const YourScreen = () => {
  return (
    <MagicScroll.SmartScrollView>
      <YourForm />
    </MagicScroll.SmartScrollView>
  );
};

// Don't forget this portion
export default MagicScroll.withSmartScroll(YourScreen);
```

Then inside your form/component you can use our TextInput.

```tsx
import MagicScroll from '@appandflow/rn-magic-scroll';

// rest of your imports

const YourForm = () => {
  return (
    <View>
      <MagicScroll.TextInput
        name="email"
        renderTop={() => <Text>Email</Text>}
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
        // This is where you can design your custom label
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

As mentioned in the introduction, the drawback of a plug-and-play library is its limitations when you need to deviate from the standard functionality. That's precisely why our library allows for customization, enabling you to tailor its usage to suit your specific needs and use cases.

## Tips

We encourage you to wrap our TextInput with your custom one.

Here an example

```tsx
import MagicScroll from '@appandflow/rn-magic-scroll';

// rest of your imports

interface Props {
  label?: string;
  isPassword?: boolean;
  name?: string;
  description?: string;
}

const YourCustomInput = (props: Props) => {
  return (
    <MagicScroll.TextInput
      name={props.name}
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
