# @ensembleui/react-runtime

## 0.3.24

### Patch Changes

- 1de1670: improve file extension validation in usePickFiles action by normalizing case
- f36876b: fix error message handle in uploadFile action

## 0.3.23

### Patch Changes

- 91e8770: Added support for disable row selection based on needed per row

## 0.3.22

### Patch Changes

- aa01532: add onKeyDown action in TextInput widget
- 43ede4b: always show pagination options in Datagrid widget
- 013ae91: expose notFoundContent property for MultiSelect widget
- dffd977: support onTriggered action in PopupMenu widget

## 0.3.21

### Patch Changes

- 0533507: revert: prevent event propagation on icon click

## 0.3.20

### Patch Changes

- b931829: Add option to allow clear input for dropdown

## 0.3.19

### Patch Changes

- 0aaa92c: fix column header by adding minWidth
- b1a3d81: feat: add selection column width property to DataGrid
- 94b90eb: prevent event propagation on icon click

## 0.3.18

### Patch Changes

- 9e9ef24: Fix: avoid empty field to validate

## 0.3.17

### Patch Changes

- 60b7851: evaluate uploadFiles inputs

## 0.3.16

### Patch Changes

- 361f64a: enhance MultiSelect component with maxCount, maxTagCount, and maxTagTextLength props
- ec03041: Fix template data re-render issue in collapsible
- 9b3d92b: Added useCommandCallback in uploadFiles

## 0.3.15

### Patch Changes

- c6213b2: Added support for reset pickFile

## 0.3.14

### Patch Changes

- c7b0386: Added support for bypassCache cache in invokeAPI

## 0.3.13

### Patch Changes

- c43f94d: Fix custom widget scope regression for undeclared inputs"

## 0.3.12

### Patch Changes

- 376f97f: Added onSearch support in multiselect

## 0.3.11

### Patch Changes

- 1ec1e32: Improve grid rendering at large volumes

## 0.3.10

### Patch Changes

- 84ce505: Prevent propagation of popupmenu items

## 0.3.9

### Patch Changes

- ead4915: fix navigateScreen action screen name and inputs evaluation

## 0.3.8

### Patch Changes

- ae9c774: Grid performance improvements
- 69d915e: Fix prevent modalContext override in API response handler
- ed2f3a0: fix ensemble api response mapping with screendata

## 0.3.7

### Patch Changes

- 19224c3: add multiple selection support in ToggleButton widget
- aa5495d: Added support for qrcode

## 0.3.6

### Patch Changes

- 3db71a9: Revert reversion of hook changes
- c63b6ff: fix added useCommandCallback
- 20c0976: fix: added support for object in values in multiselect

## 0.3.5

### Patch Changes

- 135f956: added support for HTML widget

## 0.3.4

### Patch Changes

- 4b2c4fd: preload search results
- c5d0441: register initialValue binding for Search widget instead of setting raw data
- 39ff994: fix carousel widget

## 0.3.2

### Patch Changes

- 5094d08: fix: refactor missing themeContext in useCommandCallback
- ec9d081: added support for cache in API call
- f70c0f0: Added support for await in executeCodeBlock
- 828e7e4: Added context in item-template of collapsible widget
- 80b8558: Fix datagrid render issue with namedData
- cee5d14: Allow default value for the Search widget

## 0.3.1

### Patch Changes

- cc58c97: Clear results for Search widget when focused outside the widget

## 0.3.0

### Minor Changes

- becf415: Removed default pointer cursor from Tag widget

## 0.2.15

### Patch Changes

- f0d55ec: add selectedLabel prop to Search component to allow custom widget for selected option

## 0.2.14

### Patch Changes

- 31850fe: fix navigateUrl to accept normal string url
- 89fa790: remove default scrollHeight in Datagrid to get rid of unwanted vertical scrollbar

## 0.2.13

### Patch Changes

- db0cb5e: improve performance of navigateUrl action

## 0.2.12

### Patch Changes

- a71d395: Append file input element in document body for UI automation

## 0.2.11

### Patch Changes

- 6e29dea: fix mask format on text input value paste
- e2ead08: Added toolTip widget
- fca1a65: Initialize ToggleButton with binding

## 0.2.10

### Patch Changes

- d98ae6c: added support for decimal in input type number
- 0a8fac3: improved required error message when label is not provided
- bf145b3: fix button loader binding evaluation

## 0.2.9

### Patch Changes

- 3d33f30: fix loader on on second time button load
- 116c45c: Change collapsible widget name with Accordian
- 8f733bf: Initialize text with binding
- 334c96d: Added testcase for each form elements widgets

## 0.2.8

### Patch Changes

- ff6f3bf: fix mask input required validation
- 94ca82a: Modernaization radio widget

## 0.2.7

### Patch Changes

- 6cf7cbd: add ensemble.user and ensemble.env context in navigateModalScreen hook

## 0.2.6

### Patch Changes

- 489ed91: fix form item's label not picking evaluated value

## 0.2.5

### Patch Changes

- cef48e0: Declare screen inputs even if they are not passed in with value
- 18fb646: Added range support in slider widget

## 0.2.4

### Patch Changes

- 0082369: Added fix for show only one error message for multiple validation rule
- b77be40: Added support for mask format in textInput
- f283624: Added support for qr code widget

## 0.2.3

### Patch Changes

- 7602b73: hotfix screen level style support
- b42978c: Optimize dependencies for useExecuteCode
- 69d5579: modernize PopupMenu widget
- ab37ee9: Added support to customize nooption in search widget
- 06cc75e: Remove navigation glitch from sidebar menu
- 8487a99: Added support for closeAllScreens action
- c9a5acb: Fix datagrid rows deselected issue
- 4b8f19a: fix required field validation with form.validate
- 0f9525d: fix Datagrid's defaultSelectedRowKeys
- f528819: Added support of form.onChange
- f466659: improve dropdown panel performance
- e42c9b4: added support for screen lavel font colour support

## 0.2.2

### Patch Changes

- 9eab1dc: Fix custom items premature evaluation in menu

## 0.2.1

### Patch Changes

- 071fe2c: added inputNumber for input type number
- 85f332a: Added the Drawer widget
- 4e4d9d6: Minor fixes to improve interopability with flutter

## 0.2.0

### Minor Changes

- 767850d: Refactor storage and data atoms to be more resilient in concurrent use cases

### Patch Changes

- b01b675: Added support for device object like flutter
- 58853c7: Added manual control over dropdown close
- 83076a4: Added functionality to change placeholder color

## 0.1.83

### Patch Changes

- 7c08d2d: Fix regression for multiselect

## 0.1.82

### Patch Changes

- 9a8a240: Remove unnecessary whitespace from button

## 0.1.81

### Patch Changes

- e683933: Fallback to using action inputs if none are provided

## 0.1.80

### Patch Changes

- cdaa85f: Added mockResponse support to APIs. This allows you to return a mockResponse from the api with a statusCode, reasonPhrase, body, and headers. It can be accessed and mutated using "app.useMockResponse" in a block of JS code.
- dfc5ad5: Update text binding if value chages
- 9b50023: Add functions to help with form validations
- e0cbd8e: Add maxLength and maxLengthEnforcement on text input
- Updated dependencies [cdaa85f]
  - @ensembleui/react-framework@0.1.58

## 0.1.79

### Patch Changes

- 298a6df: center align button's icon when no label is given
- f8c9226: Add html attribute pass through to form widgets
- 483a150: Fix cases where multiple modal screens are created
- Updated dependencies [2fc2ac5]
- Updated dependencies [2d5b743]
- Updated dependencies [f8c9226]
  - @ensembleui/react-framework@0.1.57

## 0.1.78

### Patch Changes

- ddb575f: fix form submission when regex is used in TextInput (bug introduced in runtime 0.1.77)

## 0.1.77

### Patch Changes

- 56036a1: fix TextInput's regex validator not validating on no input

## 0.1.76

### Patch Changes

- 78f35e7: Fix menu page matching
- 7eae5b8: Add callback options to grid functions

## 0.1.75

### Patch Changes

- 2e2fc51: fix: added support for default unit for margin and padding in icon

## 0.1.74

### Patch Changes

- 04454f2: use unique key when applying styles to modal
- Updated dependencies [04454f2]
  - @ensembleui/react-framework@0.1.56

## 0.1.73

### Patch Changes

- c6ede84: don't route when page/url is not given in menu
- 083caf1: remove UTC conversion from date widget
- 0529f2d: fix icon styles overload conflicts
- Updated dependencies [b5464ce]
  - @ensembleui/react-framework@0.1.55

## 0.1.72

### Patch Changes

- 0468a2d: Fix date input bindings
- b4bd127: add format property in Date widget

## 0.1.71

### Patch Changes

- ce61a4f: add customItem in sidebar menu
- d29ea6d: Remove container elements on menu header and footer
- e451b7a: Revert device api implementation
- 4083e6f: Added an onChange EnsembleAction for the TextInput Widget in Form
- Updated dependencies [e451b7a]
  - @ensembleui/react-framework@0.1.54

## 0.1.70

### Patch Changes

- cf4fd60: fix designated screen load on own routes
- 3a8d0ec: Support opening modals from the menu

## 0.1.69

### Patch Changes

- 5f95aed: add visible property in DataColumns of Datagrid widget
- 1e1687b: Added support for secrets variables
- 2e7a080: unset selected item height in dropdown
- Updated dependencies [1e1687b]
- Updated dependencies [1b8539e]
  - @ensembleui/react-framework@0.1.53

## 0.1.68

### Patch Changes

- 22a3e5e: Added support for device object like flutter
- 7d11468: added support for filler plugin in charts
- 8e4996c: Added shape widget for flutter compatibility
- 2d197b7: add updateValues in Form and onClear in Search widget
- Updated dependencies [22a3e5e]
  - @ensembleui/react-framework@0.1.52

## 0.1.67

### Patch Changes

- 5613deb: Added visible property for sidebar menu items

## 0.1.66

### Patch Changes

- eccc02a: Fix invokeAPI state call order
- bf4a97c: Added 3 header styles to the Collapsible widget: textColor, borderColor, and borderWidth.Added 3 header styles: textColor, borderColor, and borderWidth.

## 0.1.65

### Patch Changes

- c10a6a1: fix props evaluate in Flex
- e0edb08: render boolean value in Text widget
- Updated dependencies [57395ff]
  - @ensembleui/react-framework@0.1.51

## 0.1.64

### Patch Changes

- 036b966: added translations into studio
- Updated dependencies [036b966]
  - @ensembleui/react-framework@0.1.50

## 0.1.63

### Patch Changes

- 70715ab: rebind form's methods on every render
- Updated dependencies [70715ab]
  - @ensembleui/react-framework@0.1.49

## 0.1.62

### Patch Changes

- 49059ad: Added support for onModalDismiss in navigateScreenModal
- fb65bd1: Date widget: fix setting state value to binding value on subsequent load of widget
- Updated dependencies [49059ad]
  - @ensembleui/react-framework@0.1.47

## 0.1.61

### Patch Changes

- 0b517c8: navigateBack works properly with modal screens
- Updated dependencies [c475b7e]
  - @ensembleui/react-framework@0.1.45

## 0.1.60

### Patch Changes

- 795ef25: Fix modal rendering performance
- Updated dependencies [3a78789]
- Updated dependencies [c1a7607]
  - @ensembleui/react-framework@0.1.44

## 0.1.59

### Patch Changes

- 8fdb0da: Fix tab bar children widget rendering
- ce026a1: Added support for custom event support
- Updated dependencies [493afdf]
- Updated dependencies [ce026a1]
  - @ensembleui/react-framework@0.1.43

## 0.1.58

### Patch Changes

- e00ed50: fix form fields validation error message with field label
- 768d07f: Added support for scrollable properties on view
- 60bd855: Fix widget input intialized when no inputs have been passed
- 9ad4c4e: Fix tab bar selected index change with expressions

## 0.1.57

### Patch Changes

- a77fdcd: Convert autocomplete widget with select widget
- 5ea833d: fix Avatar's inital generation logic
- 7accf42: Added support for id and loading access of invokeAPI action level
- Updated dependencies [7af61a2]
  - @ensembleui/react-framework@0.1.42

## 0.1.56

### Patch Changes

- e44293c: expose submit method on Form

## 0.1.55

### Patch Changes

- d1c218f: add onChange action in Stepped widget
- c91b22a: delay showing stepper until its stepIndex is initialized
- af14ce4: added support for reset form

## 0.1.54

### Patch Changes

- e95ce3c: support inputType, validator and mask on TextInput widget
  support validateOnUserInteraction on form items
- debd207: implement executeConditionalAction
- Updated dependencies [42d6dc7]
- Updated dependencies [debd207]
  - @ensembleui/react-framework@0.1.40

## 0.1.53

### Patch Changes

- 7fdafa2: show just the hintText in case of empty value of Date widget
- 3cb71b7: Fix toggle button color bindings
- 1f67aee: fix: tabBar stretch option
- a28a301: Improve validation on pickFiles action
- Updated dependencies [a50e638]
- Updated dependencies [a28a301]
  - @ensembleui/react-framework@0.1.39

## 0.1.52

### Patch Changes

- 6006664: Added websocket support
- dca04a3: fix: added external params to match flutter schema
- cba60d8: Added support of height width in styles object in Image widget
- 641b066: Added support of args passing and options support in showToast action
- d1cbdc3: add styles in popupmenu widget
- d8d0e87: added support for tabBar.selectedIndex
- Updated dependencies [6006664]
- Updated dependencies [dca04a3]
- Updated dependencies [641b066]
- Updated dependencies [651fcc9]
  - @ensembleui/react-framework@0.1.38

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
