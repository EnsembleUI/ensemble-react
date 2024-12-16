# @ensembleui/react-framework

## 0.2.10

### Patch Changes

- 6cbe562: Revert hook changes

## 0.2.8

### Patch Changes

- 81891cc: Revert "fix: added useEffect cleanup in useRegisterBindings (#862)"

## 0.2.7

### Patch Changes

- 542069e: added useEffect cleanup for unload widget on unmounted

## 0.2.6

### Patch Changes

- db0cb5e: improve performance of navigateUrl action

## 0.2.5

### Patch Changes

- ef1744c: added support for custom fonts

## 0.2.4

### Patch Changes

- cef48e0: Declare screen inputs even if they are not passed in with value

## 0.2.3

### Patch Changes

- b42978c: Optimize dependencies for useExecuteCode
- 6c59f18: ensure user atom overwrite keys
- 8487a99: Added support for closeAllScreens action

## 0.2.2

### Patch Changes

- 549a952: Fix device atom reporting same values

## 0.2.1

### Patch Changes

- 5163b57: Ensure screen and data APIs overwrite keys
- 4e4d9d6: Minor fixes to improve interopability with flutter

## 0.2.0

### Minor Changes

- 767850d: Refactor storage and data atoms to be more resilient in concurrent use cases

### Patch Changes

- b01b675: Added support for device object like flutter

## 0.1.58

### Patch Changes

- cdaa85f: Added mockResponse support to APIs. This allows you to return a mockResponse from the api with a statusCode, reasonPhrase, body, and headers. It can be accessed and mutated using "app.useMockResponse" in a block of JS code.

## 0.1.57

### Patch Changes

- 2fc2ac5: fix: choose first theme as default from the theme yaml
- 2d5b743: fix flutter disparity issue
- f8c9226: Add html attribute pass through to form widgets

## 0.1.56

### Patch Changes

- 04454f2: use unique key when applying styles to modal

## 0.1.55

### Patch Changes

- b5464ce: fix home screen load issue

## 0.1.54

### Patch Changes

- e451b7a: Revert device api implementation

## 0.1.53

### Patch Changes

- 1e1687b: Added support for secrets variables
- 1b8539e: Added support of env in preview and studio

## 0.1.52

### Patch Changes

- 22a3e5e: Added support for device object like flutter

## 0.1.51

### Patch Changes

- 57395ff: Added support for translation bundle

## 0.1.50

### Patch Changes

- 036b966: added translations into studio

## 0.1.49

### Patch Changes

- 70715ab: rebind form's methods on every render

## 0.1.48

### Patch Changes

- 472d655: compare invokable methods in register bindings too to get rid of stale methods
- 5eaf03d: Added support for flutter style hex color codes

## 0.1.47

### Patch Changes

- 49059ad: Added support for onModalDismiss in navigateScreenModal

## 0.1.46

### Patch Changes

- 790bbb9: fix combine expression checker

## 0.1.45

### Patch Changes

- c475b7e: Added support for multiple expression support

## 0.1.44

### Patch Changes

- 3a78789: fix: style priority issue
- c1a7607: added support of access environment variables through env into expressions

## 0.1.43

### Patch Changes

- 493afdf: revert ensemble storage property access without get method
- ce026a1: Added support for custom event support

## 0.1.42

### Patch Changes

- 7af61a2: Added support to read storage without get method

## 0.1.41

### Patch Changes

- dbb6a69: Fix user atom propagation across app

## 0.1.40

### Patch Changes

- 42d6dc7: fix ensemble.user on widget load action
- debd207: implement executeConditionalAction

## 0.1.39

### Patch Changes

- a50e638: replace api.uri with api.url
- a28a301: Improve validation on pickFiles action

## 0.1.38

### Patch Changes

- 6006664: Added websocket support
- dca04a3: fix: added external params to match flutter schema
- 641b066: Added support of args passing and options support in showToast action
- 651fcc9: fix: handle empty theme file

## 0.1.37

### Patch Changes

- 41bbdd8: fix: added support of widgets styles in themes

## 0.1.36

### Patch Changes

- 7780b49: Fix testid regression
- 2b07531: Added support to define custom widget in screen

## 0.1.35

### Patch Changes

- 5c00a86: added openUrl action for flutter compatibility
- 3cce71f: handle nullish values in useStyles

## 0.1.34

### Patch Changes

- 0730867: Added support for import scripts

## 0.1.33

### Patch Changes

- f1cf9b0: added support of expression in style and class names
- 12eada9: add humanize method to ensemble formatter
- 8b6a691: Add initial support for executeActionGroup

## 0.1.32

### Patch Changes

- 357d754: Fix context passing on imperative invoke API

## 0.1.31

### Patch Changes

- f566152: Optionally debounce state updates for rapid state changes
- f566152: Support env variables in API uris

## 0.1.30

### Patch Changes

- 6fb1095: added id attribute in form item to update form element value through setValue

## 0.1.29

### Patch Changes

- 28a734a: add force option in useRegisterBindings hook

## 0.1.28

### Patch Changes

- 19d2369: Fix forced string coercion when fetching data
- 57b6697: Fix stale data in ensemble.invokeAPI

## 0.1.27

### Patch Changes

- 136d130: Add click callback to Button

## 0.1.26

### Patch Changes

- 0e65e56: add onChange action in Checkbox widget
- 392d9d1: Update acorn ECMAScript version to 2020 for optional chaining and nullish coalescing

## 0.1.25

### Patch Changes

- de7d06b: Fix various issues with action hooks

## 0.1.24

### Patch Changes

- f44932f: Added support for multiple theme support

## 0.1.23

### Patch Changes

- 765acec: Added support for styles in view
- e0b96f5: adopted the dot notation CSS class-based styling while introducing the className attribute to the styles. also, deprecated the names attribute os styles.

## 0.1.22

### Patch Changes

- 15edfd3: added navigateExternalScreen API
- 8667e65: added router params example in kitchen sink
- 4735198: refactor modal styles

## 0.1.21

### Patch Changes

- e15a61f: add navigateBack action
- cc10f29: fix casing of 'invokeApi' to 'invokeAPI' and add invokeAPI in js
- 1cc168b: added subscribe in useEnsembleUser

## 0.1.20

### Patch Changes

- e12ddd6: added support of dynamic columns in datagrid

## 0.1.19

### Patch Changes

- d789ccb: Update preview for studio integration

## 0.1.18

### Patch Changes

- e1a7112: Render conditional widgets with unique keys

## 0.1.17

### Patch Changes

- 208025e: add getDaysDifference, getMonthsDifference and getYearsDifference in date formatter api

## 0.1.16

### Patch Changes

- 6cf809f: Various fixes related to scoping

## 0.1.15

### Patch Changes

- 05b86a8: Fixes for scope propagation refactor
- 9b06b0e: Make sidebar menu collapsible

## 0.1.14

### Patch Changes

- 4114d92: Clean up scope propagation and context creation

## 0.1.13

### Patch Changes

- 7c51b44: enhance styles to some widgets

## 0.1.12

### Patch Changes

- 3a92e56: support returning last multiline statement of multiline js
- 12c6bb9: Added the support of item-template inside the dropdown widget

## 0.1.11

### Patch Changes

- 768201a: Added support of HTML Attributes passthrough
- 0d3ccee: Fix the crashing of charts
- caf9c41: added support of endpoint apis in custom widgets

## 0.1.10

### Patch Changes

- b5abf23: add showDialog action
- 8c657ab: Fix small issues with Dropdown

## 0.1.9

### Patch Changes

- 71c37db: added navigation api and location api

## 0.1.8

### Patch Changes

- 3ebbee5: Remove getoninit from storage atoms

## 0.1.7

### Patch Changes

- 29def14: Add skeleton widget

## 0.1.6

### Patch Changes

- bfe63ce: Add LoadingContainer widget
- 95025ff: fix properties of style names not being applied

## 0.1.5

### Patch Changes

- f09c171: fixed context undefined for onLoad action
- e510d2f: Google signin widget and expose application context env into actions and widgets

## 0.1.4

### Patch Changes

- 3ffa150: Add user atom

## 0.1.3

### Patch Changes

- 8175f33: add ensemble formatter date api

## 0.1.2

### Patch Changes

- 776c865: Resolve API body paylods of text type
- 776c865: Enhance Search widget to search via API

## 0.1.1

### Patch Changes

- e46acd9: Update widgets to use evaluated styles
- 9f64fc0: Implement ensemble storage with session storage

## 0.1.0

### Minor Changes

- c59e366: added ToggleButton widget

### Patch Changes

- e37dece: Evaluate inputs before navigating screen

## 0.0.13

### Patch Changes

- 84deb25: Normalize dependencies

## 0.0.12

### Patch Changes

- 84f691a: Fix stale storage reference

## 0.0.11

### Patch Changes

- 284be43: Only store state for widgets with explicit ids
- 284be43: Fix data context keys being overridden by undefined widget keys
- dbd93e5: Trigger binding updates on storage change

## 0.0.10

### Patch Changes

- 58316cc: Add sorting and filter to grid
- 8f77365: Update bindings on data change

## 0.0.9

### Patch Changes

- 2c1bb2a: Support executing code from script file
- eee9851: Evaluate widget ids as expressions

## 0.0.8

### Patch Changes

- 55dc0ff: Share styling across app with theme config file

## 0.0.7

### Patch Changes

- 3ce8327: Improve error handling
- 6a4d3fd: Improve data-testid ref handling

## 0.0.6

### Patch Changes

- 59d32b0: Add support for custom widgets
- b3968f8: Various bug fixes for chart sizing, custom widgets, and testids

## 0.0.5

### Patch Changes

- Add datatest-id support

## 0.0.4

### Patch Changes

- fc85e1f: Update register bindings to return resolved state values
- c0126ea: Short term fix for performance
- 649fc3d: Improve performance from interpolated bindings

## 0.0.3

### Patch Changes

- 266ef49: Add line chart

## 0.0.2

### Patch Changes

- Remove ESM format

## 0.0.1

### Patch Changes

- 45898e9: Release react packages
