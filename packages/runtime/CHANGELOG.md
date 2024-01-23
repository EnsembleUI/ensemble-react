# @ensembleui/react-runtime

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
