# Ensemble React CRA Template

This project serves as a starter template and example for using Ensemble UI library with React.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn how to integrate Ensemble with an existing React app or another scaffolding tool, see [here](#how-to-integrate-ensemble)

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

# How to Integrate Ensemble

Ensemble is available as npm packages you can install and use in an existing or new React app. 

## Authorize Github Packages

Currently, the packages are privately hosted on Github but will become publicly released at a later date.

See Github's [official docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages) on how to authenticate to Github Packages.

You will also need to configure your `.npmrc` file to include

```
@ensembleui:registry=https://npm.pkg.github.com
```

## Install Ensemble Packages

Use your favorite package manager to install the Ensemble packages.

```
# npm
npm install @ensembleui/react-runtime @ensembleui/react-framework

# yarn
yarn add @ensembleui/react-runtime @ensembleui/react-framework

# pnpm
pnpm install @ensembleui/react-runtime @ensembleui/react-framework
```

## (Optional) Setup Local Ensemble Application

If you are including your Ensemble application as part of your React app, you can configure your build tool to treat it as source.

### Webpack

Add a rule to configure the YAML as source:

```javascript
  module: {
    rules: [
      ...
      {
        // You may need a more specific glob if you have other YAML files unrelated to Ensemble
        test: /\.yaml$/i,
        type: "asset/source",
      },
      ...
    ],
  },
```

### Typescript

You will need to add a type declaration file as well:

```typescript
declare module "*.yaml" {
  const data: string;
  export default data;
}
```

## Add Ensemble Container

Add the `EnsembleApp` component where you would like your Ensemble app to render:

```jsx
import { EnsembleApp } from "@ensembleui/react-runtime";
import type { ApplicationDTO } from "@ensembleui/react-framework";

// If including YAML as source, import it and construct your app
const testApp: ApplicationDTO = { ... }
const App: React.FC = () => {
  return (
    <div className="App">
      <EnsembleApp appId="test" application={testApp} />
    </div>
  );
};
```

See this [example](https://github.com/EnsembleUI/ensemble-react/blob/evshi/readme/apps/starter/src/App.tsx#L16) on how to import and construct source YAML files as an application.

## (Optional) Registering Widgets

If you need to add a new widget or would like to override an existing implementation, register your Widget before your app renders, i.e. at the top of a module.

```jsx
import { WidgetRegistry } from "@ensembleui/react-runtime"
import { useRegisterBindings } from "@ensembleui/react-framework"

// Your YAML properties will be injected as component props
export const MyCustomWidget: React.FC = (props) => {
  const [value, setValue] = useState(0)

  // Call the useRegisterBindings hook to automatically evaluate expressions and expose controls for your component to Ensemble
  const { values} = useRegisterBindings(
    ...props, 
    props.id,
    { setValue }
  )
  return ...
}

WidgetRegistry.register("MyCustomWidget", MyCustomWidget);
```

We currently only support function components.