### Import :
```js
const Resizer = brackets.getModule("utils/Resizer")
```

<a name="DIRECTION_VERTICAL"></a>

## DIRECTION\_VERTICAL
Resizer is a Module utility to inject resizing capabilities to any elementinside Brackets.On initialization, Resizer discovers all nodes tagged as "vert-resizable"and "horz-resizable" to add the resizer handler. Additionally, "top-resizer","bottom-resizer", "left-resizer" and "right-resizer" classes control theposition of the resizer on the element.An element can be made resizable at any time using the `makeResizable()` API.Panel sizes are saved via preferences and restored when the DOM node becomes resizableagain in a subsequent launch.The resizable elements trigger a panelResizeStart, panelResizeUpdate and panelResizeEndevent that can be used to create performance optimizations (such as hiding/showing elementswhile resizing), custom layout logic, etc. See makeResizable() for details on the events.A resizable element can be collapsed/expanded using the `show`, `hide` and `toggle` APIs orvia user action. This triggers panelCollapsed/panelExpanded events - see makeResizable().

**Kind**: global variable  
<a name="show"></a>

## show(element)
Shows a resizable element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element to show if possible |

<a name="hide"></a>

## hide(element)
Hides a resizable element.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element to hide if possible |

<a name="toggle"></a>

## toggle(element)
Changes the visibility state of a resizable element. The togglefunctionality is added when an element is made resizable.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element to toggle |

<a name="removeSizable"></a>

## removeSizable(element)
Removes the resizability of an element if it's resizable

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element in which to remove sizing |

<a name="resyncSizer"></a>

## resyncSizer(element)
Updates the sizing div by resyncing to the sizing edge of the elementCall this method after manually changing the size of the element

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element whose sizer should be resynchronized |

<a name="isVisible"></a>

## isVisible(element) ⇒ <code>boolean</code>
Returns the visibility state of a resizable element.

**Kind**: global function  
**Returns**: <code>boolean</code> - true if element is visible, false if it is not visible  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | Html element to toggle |

<a name="makeResizable"></a>

## makeResizable(element, direction, position, minSize, collapsible, forceLeft, createdByWorkspaceManager, usePercentages, forceRight, _attachToParent, [initialSize])
Adds resizing and (optionally) expand/collapse capabilities to a given html element. The element's size& visibility are automatically saved & restored as a view-state preference.Resizing can be configured in two directions: - Vertical ("vert"): Resizes the height of the element - Horizontal ("horz"): Resizes the width of the elementResizer handlers can be positioned on the element at: - Top ("top") or bottom ("bottom") for vertical resizing - Left ("left") or right ("right") for horizontal resizingA resizable element triggers the following events while resizing: - panelResizeStart: When the resize starts. Passed the new size. - panelResizeUpdate: When the resize gets updated. Passed the new size. - panelResizeEnd: When the resize ends. Passed the final size. - panelCollapsed: When the panel gets collapsed (or hidden). Passed the last size     before collapse. May occur without any resize events. - panelExpanded: When the panel gets expanded (or shown). Passed the initial size.     May occur without any resize events.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>DOMNode</code> | DOM element which should be made resizable. Must have an id attribute, for                          use as a preferences key. |
| direction | <code>string</code> | Direction of the resize action: one of the DIRECTION_* constants. |
| position | <code>string</code> | Which side of the element can be dragged: one of the POSITION_* constants                          (TOP/BOTTOM for vertical resizing or LEFT/RIGHT for horizontal). |
| minSize | <code>number</code> | Minimum size (width or height) of the element's outer dimensions, including                          border & padding. Defaults to DEFAULT_MIN_SIZE. |
| collapsible | <code>boolean</code> | Indicates the panel is collapsible on double click on the                          resizer. Defaults to false. |
| forceLeft | <code>string</code> | CSS selector indicating element whose 'left' should be locked to the                          the resizable element's size (useful for siblings laid out to the right of                          the element). Must lie in element's parent's subtree. |
| createdByWorkspaceManager | <code>boolean</code> | For internal use only |
| usePercentages | <code>boolean</code> | Maintain the size of the element as a percentage of its parent                          the default is to maintain the size of the element in pixels |
| forceRight | <code>string</code> | CSS selector indicating element whose 'right' should be locked to the                          the resizable element's size (useful for siblings laid out to the left of                          the element). Must lie in element's parent's subtree. |
| _attachToParent | <code>boolean</code> | Attaches the resizer element to parent of the element rather than                          to element itself. Attach the resizer to the parent *ONLY* if element has the                          same offset as parent otherwise the resizer will be incorrectly positioned.                          FOR INTERNAL USE ONLY |
| [initialSize] | <code>number</code> | Optional Initial size of panel in px. If not given, panel will use minsize      or current size. |

