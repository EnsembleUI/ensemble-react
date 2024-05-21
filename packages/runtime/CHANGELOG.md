# @ensembleui/react-runtime

## 0.1.51

### Patch Changes

- 41bbdd8: fix: added support of widgets styles in themes
- 693be2c: bind form id and expose getValues method
- 9c720b8: fix allowSelection and selectionType binding of Datagrid
- Updated dependencies [41bbdd8]
  - @ensembleui/react-framework@0.1.37

## 0.1.50

### Patch Changes

- a09ba40: fix enabled property of form items
- 2b07531: Added support to define custom widget in screen
- 10e1c8c: reset options when there are no options on search query
- 6afd361: Retrofit avatar widget with rootRef
- 99ea07c: added loading attribute in button widget
- 7bf1c51: added curPage in dataGrid
- 5d1abc2: Fix button icons alignment
  Override default styles of Lottie when given from yaml
- Updated dependencies [7780b49]
- Updated dependencies [2b07531]
  - @ensembleui/react-framework@0.1.36

## 0.1.49

### Patch Changes

- 1ed18c1: Hotfix - restore ensemble context in useInvokeAPI

## 0.1.48

### Patch Changes

- f1b1940: bind pickFiles attributes
- 6c1004e: Add stack widget
- 397781a: added aspectRation in charts for responsiveness
- 205415c: fix search in multiselect
- 2770ed9: added support of arguments in navigateUrl
- 5c00a86: added openUrl action for flutter compatibility
- b08c208: fix showDialog's height to whatever user has given
- 23cf277: Support external links in sidebar menu items
- 8b092af: bind invokeAPI name
- Updated dependencies [5c00a86]
- Updated dependencies [3cce71f]
  - @ensembleui/react-framework@0.1.35

## 0.1.47

### Patch Changes

- 02dca79: fix initial value of ToggleButton
- 3c5c191: Make Search widget event symmetrical with data binding
- 38d10e1: expose context in executeActionGroup

## 0.1.46

### Patch Changes

- 8a0b3a1: added defaultSelected Row in datagrid
- c923f2a: fix search input infinite render issue
- Updated dependencies [0730867]
  - @ensembleui/react-framework@0.1.34

## 0.1.45

### Patch Changes

- df66279: support for radio type in DataGrid
- f801ba7: show empty progress bar when filledPercentage is 0

## 0.1.44

### Patch Changes

- 593537d: Added support for onPageChange action handler
- 8072925: Add functionality to disable create new options in multiselect
- 8b6a691: Add initial support for executeActionGroup
- 4c5cba2: Added support for onSort action handler in datagrid
- 3cdf0db: fix navigateExternalScreen API to accept the args from the other actions
- 887f10a: set value of Radio as undefined instead of "undefined"
- 87876d7: fix toggle button bindings
- Updated dependencies [f1cf9b0]
- Updated dependencies [12eada9]
- Updated dependencies [8b6a691]
  - @ensembleui/react-framework@0.1.33

## 0.1.43

### Patch Changes

- 3b61b34: receive updated values from all form elements

## 0.1.42

### Patch Changes

- 357d754: Fix context passing on imperative invoke API
- Updated dependencies [357d754]
  - @ensembleui/react-framework@0.1.32

## 0.1.41

### Patch Changes

- 3da9f12: Add ensemble env to imperative invokeAPI
- f566152: Optionally debounce state updates for rapid state changes
- f566152: Support env variables in API uris
- Updated dependencies [f566152]
- Updated dependencies [f566152]
  - @ensembleui/react-framework@0.1.31

## 0.1.40

### Patch Changes

- 19b5491: Add onDrag handler for Image
- 6fb1095: added id attribute in form item to update form element value through setValue
- Updated dependencies [6fb1095]
  - @ensembleui/react-framework@0.1.30

## 0.1.39

### Patch Changes

- 1bab3df: fix: dropdown render after options loaded
- 5fe6778: Fix ChartDataLabels plugin handling
- Updated dependencies [28a734a]
  - @ensembleui/react-framework@0.1.29

## 0.1.38

### Patch Changes

- c55632d: Handle nullish label in DataColumn
- 57b6697: Fix stale data in ensemble.invokeAPI
- Updated dependencies [19d2369]
- Updated dependencies [57b6697]
  - @ensembleui/react-framework@0.1.28

## 0.1.37

### Patch Changes

- 35901fe: add ability to pass DataColumn's label as a widget too
- bb779a7: Re-render screen when path changes

## 0.1.36

### Patch Changes

- 136d130: Add click callback to Button
- 17efe4f: added plugins support in doughnutchart and linechart
- Updated dependencies [136d130]
  - @ensembleui/react-framework@0.1.27

## 0.1.35

### Patch Changes

- 0e65e56: add onChange action in Checkbox widget
- Updated dependencies [0e65e56]
- Updated dependencies [392d9d1]
  - @ensembleui/react-framework@0.1.26

## 0.1.34

### Patch Changes

- de7d06b: Fix various issues with action hooks
- Updated dependencies [de7d06b]
  - @ensembleui/react-framework@0.1.25

## 0.1.33

### Patch Changes

- f44932f: Added support for multiple theme support
- 6b4b2e8: added support to return the API response in ensemble.invokeAPI
- Updated dependencies [f44932f]
  - @ensembleui/react-framework@0.1.24

## 0.1.32

### Patch Changes

- 3edecd3: support for activeStepIndex as expression
- 4720898: added column resizable feature
- 4caacc7: Support expressions in navigateUrl
- 765acec: Added support for styles in view
- e0b96f5: adopted the dot notation CSS class-based styling while introducing the className attribute to the styles. also, deprecated the names attribute os styles.
- e36b8a0: fix modal's onDialogDismiss
- Updated dependencies [765acec]
- Updated dependencies [e0b96f5]
  - @ensembleui/react-framework@0.1.23

## 0.1.31

### Patch Changes

- a2958cf: add FittedRow and FittedColumn widgets
- 6585231: added image cropper widget
- 2e55ef9: Added daterange picker widget
- ae8405f: added onMouseEnter and onMouseLeave
- 15edfd3: added navigateExternalScreen API
- 8667e65: added router params example in kitchen sink
- 4735198: refactor modal styles
- Updated dependencies [15edfd3]
- Updated dependencies [8667e65]
- Updated dependencies [4735198]
  - @ensembleui/react-framework@0.1.22

## 0.1.30

### Patch Changes

- 799597a: added switch widget
- 1e0c49c: added slider widget
- 8a960d6: added flex widget
- ced5d5e: add Lottie widget
- e15a61f: add navigateBack action
- cc10f29: fix casing of 'invokeApi' to 'invokeAPI' and add invokeAPI in js
- 1794552: enhance style options for tabBar
- 1cc168b: added subscribe in useEnsembleUser
- Updated dependencies [e15a61f]
- Updated dependencies [cc10f29]
- Updated dependencies [1cc168b]
  - @ensembleui/react-framework@0.1.21

## 0.1.29

### Patch Changes

- 32281dc: Fix bad merge erasing data grid row index

## 0.1.28

### Patch Changes

- 36e127e: Added block of passthrough event on collapsible widget
- 602ac3e: fixed styles for toggle button

## 0.1.27

### Patch Changes

- 70e700d: added onHover to Icon

## 0.1.26

### Patch Changes

- 31583e0: fix progress styles
- d55d0d2: expose useEnsembleAction hook for outer world
- e12ddd6: added support of dynamic columns in datagrid
- Updated dependencies [e12ddd6]
  - @ensembleui/react-framework@0.1.20

## 0.1.25

### Patch Changes

- ddcc772: update bindings for MultiSelect widget
- b93fc80: add showDialog and closeAllDialogs api

## 0.1.24

### Patch Changes

- 044367a: added support of infinite scroll in gridview
- bca1ecf: Fix selected styling on menu
- c63ab76: allow max-content as default scrollWidth
- 54702bc: Includ row index in data grid cell context
- d789ccb: Update preview for studio integration
- Updated dependencies [d789ccb]
  - @ensembleui/react-framework@0.1.19

## 0.1.23

### Patch Changes

- e1a7112: Render conditional widgets with unique keys
- Updated dependencies [e1a7112]
  - @ensembleui/react-framework@0.1.18

## 0.1.22

### Patch Changes

- 681408e: Added feature for enable stickey header and footer in data grid widget
- 84f9610: Ensure dialogs have access to screen scope
- 4a69bc6: updated styles for some widgets

## 0.1.21

### Patch Changes

- b9633f3: added stop event propogation in button onTap action
- db41e4a: Added support of default value in dropdown
- 2196d64: exposed url params and route query into screen context
- Updated dependencies [208025e]
  - @ensembleui/react-framework@0.1.17

## 0.1.20

### Patch Changes

- 6cf809f: make showDialog screen aware
- 6cf809f: Various fixes related to scoping
- Updated dependencies [6cf809f]
  - @ensembleui/react-framework@0.1.16

## 0.1.19

### Patch Changes

- 67ab5d0: Add onTap to Icon
- 854f51c: add onChange and item styles in radio widget
- 05b86a8: Fixes for scope propagation refactor
- 9b06b0e: Make sidebar menu collapsible
- Updated dependencies [05b86a8]
- Updated dependencies [9b06b0e]
  - @ensembleui/react-framework@0.1.15

## 0.1.18

### Patch Changes

- 4114d92: Clean up scope propagation and context creation
- 084ffc1: enhance showdialog action options to support title and close icon
- 0c4bd30: Added widget support inside the label of popup menu
- 63a81a0: added support of widgets inside the label of form items
- Updated dependencies [4114d92]
  - @ensembleui/react-framework@0.1.14

## 0.1.17

### Patch Changes

- fea627b: Fix form items and add example usage
- 7a129f8: fix nested showDialogs
- 6c04a34: added item-template in popup menu widget
- 15e89cd: Re-implement Date widget

## 0.1.16

### Patch Changes

- bfa8f2f: Added collapsible widget with item-template
- 79e4dfe: added ability to select rows in datagird, support for multiselect onItemSelect event

## 0.1.15

### Patch Changes

- 2f482d3: Render child screens when entering apps without menu
- f1a513d: added onTap to row widget
- 7aa7dad: added api for navigateUrl to navigate screen using url
- 7c51b44: enhance styles to some widgets
- Updated dependencies [7c51b44]
  - @ensembleui/react-framework@0.1.13

## 0.1.14

### Patch Changes

- 39d658a: exposed user object to esnemble
- fbc8646: Handle nullable item template in dropdown
- 12c6bb9: Added the support of item-template inside the dropdown widget
- Updated dependencies [3a92e56]
- Updated dependencies [12c6bb9]
  - @ensembleui/react-framework@0.1.12

## 0.1.13

### Patch Changes

- 0e18704: Added support of inputs in navigatescreen api
- 768201a: Added support of HTML Attributes passthrough
- a9c0b97: added support of theme values into sidebar menu
- 0d3ccee: Fix the crashing of charts
- caf9c41: added support of endpoint apis in custom widgets
- Updated dependencies [768201a]
- Updated dependencies [0d3ccee]
- Updated dependencies [caf9c41]
  - @ensembleui/react-framework@0.1.11

## 0.1.12

### Patch Changes

- f9a80b9: Add active step indicator to Stepper widget

## 0.1.11

### Patch Changes

- b5abf23: add showDialog action
- 8c657ab: Fix small issues with Dropdown
- c8d1932: fix infinite charts re-renders when function is passed in config

## 0.1.10

### Patch Changes

- 2aa6524: Support the expressions in placeholder of search widget
- 71c37db: added navigation api and location api

## 0.1.9

### Patch Changes

- 3ebbee5: Remove getoninit from storage atoms

## 0.1.8

### Patch Changes

- 29def14: Add skeleton widget

## 0.1.7

### Patch Changes

- 1f93b5e: fix chart options
- bfe63ce: Add LoadingContainer widget
- 25366e6: fixed re-curring call of onResponse under onComplete

## 0.1.6

### Patch Changes

- f09c171: fixed context undefined for onLoad action
- b28ec5f: Fix broken index reference for GridView templates
- e983a0e: stepper widgte styling updates and fixed
- 0690646: Added onTap action on each row of datagrid widgets
- e510d2f: Google signin widget and expose application context env into actions and widgets
- b28ec5f: Support base pathname

## 0.1.5

### Patch Changes

- 3ffa150: Add user atom
- 28dd9f4: exposed index and length fot item-template Row and Col

## 0.1.4

### Patch Changes

- 8175f33: add ensemble formatter date api
- da52d57: Add support for ToggleButton data-testid

## 0.1.3

### Patch Changes

- 82375e0: added support for expressions in divider, icon and toggleButton widgets
- 46d3040: Exposed onItemSelect method for dropdown

## 0.1.2

### Patch Changes

- 776c865: Resolve API body paylods of text type
- 776c865: Enhance Search widget to search via API
- 8640c16: Fix issue with executeCode only running once

## 0.1.1

### Patch Changes

- 03fc15c: Deep clone inputs before evaluation
- e46acd9: Update widgets to use evaluated styles
- 9f64fc0: Implement ensemble storage with session storage
- 2b8cbce: Add Date widget

## 0.1.0

### Minor Changes

- c59e366: added ToggleButton widget

### Patch Changes

- afdf178: Add item-template support in Row and Column widgets
- e37dece: Evaluate inputs before navigating screen

## 0.0.13

### Patch Changes

- 84deb25: Normalize dependencies

## 0.0.12

### Patch Changes

- bf12a2e: Fix runtime package dependency

## 0.0.11

### Patch Changes

- 67bffb7: Skip screen height calculation if modal
- 284be43: Only store state for widgets with explicit ids
- b70f000: Skip navigating to selected screen if path is not empty
- 51bfb7c: Register custom widget inputs as bindings
- e238827: Improve chart config evaluation
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
