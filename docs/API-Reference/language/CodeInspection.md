### Import :
```js
const CodeInspection = brackets.getModule("language/CodeInspection")
```

<a name="_"></a>

## \_
Manages linters and other code inspections on a per-language basis. Provides a UI and status indicator for

**Kind**: global constant  
<a name="Type"></a>

## Type
Values for problem's 'type' property

**Kind**: global constant  

* [Type](#Type)
    * [.ERROR](#Type.ERROR)
    * [.WARNING](#Type.WARNING)
    * [.META](#Type.META)

<a name="Type.ERROR"></a>

### Type.ERROR
Unambiguous error, such as a syntax error

**Kind**: static property of [<code>Type</code>](#Type)  
<a name="Type.WARNING"></a>

### Type.WARNING
Maintainability issue, probable error / bad smell, etc.

**Kind**: static property of [<code>Type</code>](#Type)  
<a name="Type.META"></a>

### Type.META
Inspector unable to continue, code too complex for static analysis, etc. Not counted in err/warn tally.

**Kind**: static property of [<code>Type</code>](#Type)  
<a name="PREF_ENABLED"></a>

## PREF\_ENABLED
Constants for the preferences defined in this file.

**Kind**: global constant  
<a name="setGotoEnabled"></a>

## setGotoEnabled(gotoEnabled)
Enable or disable the "Go to First Error" command

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| gotoEnabled | <code>boolean</code> | Whether it is enabled. |

<a name="getProvidersForPath"></a>

## getProvidersForPath(filePath) ⇒ <code>Object</code>
Returns a list of provider for given file path, if available.

**Kind**: global function  

| Param | Type |
| --- | --- |
| filePath | <code>string</code> | 

<a name="getProviderIDsForLanguage"></a>

## getProviderIDsForLanguage(languageId) ⇒ <code>Array.&lt;string&gt;</code>
Returns an array of the IDs of providers registered for a specific language

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Names of registered providers.  

| Param | Type |
| --- | --- |
| languageId | <code>string</code> | 

<a name="inspectFile"></a>

## inspectFile(file, providerList) ⇒ <code>$.Promise</code>
Runs a file inspection over passed file. Uses the given list of providers if specified, otherwise uses

**Kind**: global function  
**Returns**: <code>$.Promise</code> - a jQuery promise that will be resolved with ?\{provider:Object, result: ?\{errors:!Array, aborted:boolean}}  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | File that will be inspected for errors. |
| providerList | <code>Object</code> | Array |

<a name="updatePanelTitleAndStatusBar"></a>

## updatePanelTitleAndStatusBar(numProblems, Array, aborted, fileName)
Update the title of the problem panel and the tooltip of the status bar icon. The title and the tooltip will

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| numProblems | <code>Number</code> | total number of problems across all providers |
| Array | <code>Object</code> | providersReportingProblems - providers that reported problems |
| aborted | <code>boolean</code> | true if any provider returned a result with the 'aborted' flag set |
| fileName |  |  |

<a name="_createMarkerElement"></a>

## \_createMarkerElement(editor, line, ch, type, message, isFixable) ⇒
It creates a div element with a span element inside it, and then adds a click handler to move cursor to the

**Kind**: global function  
**Returns**: A DOM element.  

| Param | Description |
| --- | --- |
| editor | the editor instance |
| line | the line number of the error |
| ch | the character position of the error |
| type | The type of the marker. This is a string that can be one of the error types |
| message | The message that will be displayed when you hover over the marker. |
| isFixable | true if we need to use the fix icon |

<a name="run"></a>

## run(providerName)
Run inspector applicable to current document. Updates status bar indicator and refreshes error list in

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| providerName | <code>string</code> | name of the provider that is requesting a run |

<a name="getProvidersForLanguageId"></a>

## getProvidersForLanguageId()
Returns a list of providers registered for given languageId through register function

**Kind**: global function  
<a name="updateListeners"></a>

## updateListeners()
Update DocumentManager listeners.

**Kind**: global function  
<a name="toggleEnabled"></a>

## toggleEnabled(enabled, doNotSave)
Enable or disable all inspection.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| enabled | <code>boolean</code> | Enabled state. If omitted, the state is toggled. |
| doNotSave | <code>boolean</code> | true if the preference should not be saved to user settings. This is generally for events triggered by project-level settings. |

<a name="toggleCollapsed"></a>

## toggleCollapsed(collapsed, doNotSave)
Toggle the collapsed state for the panel. This explicitly collapses the panel (as opposed to

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| collapsed | <code>boolean</code> | Collapsed state. If omitted, the state is toggled. |
| doNotSave | <code>boolean</code> | true if the preference should not be saved to user settings. This is generally for events triggered by project-level settings. |

<a name="handleGotoFirstProblem"></a>

## handleGotoFirstProblem()
Command to go to the first Problem

**Kind**: global function  
<a name="Error"></a>

## Error : <code>Object</code>
Registers a provider for a specific language to inspect files and provide linting results.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| languageId | <code>string</code> | The language ID for which the provider is registered. |
| provider | <code>Object</code> | The provider object. |
| provider.name | <code>string</code> | The name of the provider. |
| provider.scanFile | <code>function</code> | Synchronous scan function. |
| provider.scanFileAsync | <code>function</code> | Asynchronous scan function returning a Promise. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| pos | <code>Object</code> | The start position of the error. |
| pos.line | <code>number</code> | The line number (0-based). |
| pos.ch | <code>number</code> | The character position within the line (0-based). |
| endPos | <code>Object</code> | The end position of the error. |
| endPos.line | <code>number</code> | The end line number (0-based). |
| endPos.ch | <code>number</code> | The end character position within the line (0-based). |
| message | <code>string</code> | The error message to be displayed as text. |
| htmlMessage | <code>string</code> | The error message to be displayed as HTML. |
| type | [<code>Type</code>](#Type) | The type of the error. Defaults to `Type.WARNING` if unspecified. |
| fix | <code>Object</code> | An optional fix object. |
| fix.replace | <code>string</code> | The text to replace the error with. |
| fix.rangeOffset | <code>Object</code> | The range within the text to replace. |
| fix.rangeOffset.start | <code>number</code> | The start offset of the range. |
| fix.rangeOffset.end | <code>number</code> | The end offset of the range. If no errors are found, return either `null`(treated as file is problem free) or an object with a zero-length `errors` array. Always use `message` to safely display the error as text. If you want to display HTML error message, then explicitly use `htmlMessage` to display it. Both `message` and `htmlMessage` can be used simultaneously. After scanning the file, if you need to omit the lint result, return or resolve with `{isIgnored: true}`. This prevents the file from being marked with a no errors tick mark in the status bar and excludes the linter from the problems panel. |
