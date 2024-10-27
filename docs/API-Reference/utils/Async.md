### Import :
```js
const Async = brackets.getModule("utils/Async")
```

<a name="PromiseQueue"></a>

## PromiseQueue
**Kind**: global class  

* [PromiseQueue](#PromiseQueue)
    * [new PromiseQueue()](#new_PromiseQueue_new)
    * [.add(op)](#PromiseQueue+add)
    * [.removeAll()](#PromiseQueue+removeAll)

<a name="new_PromiseQueue_new"></a>

### new PromiseQueue()
Creates a queue of async operations that will be executed sequentially. Operations can be added to the

<a name="PromiseQueue+add"></a>

### promiseQueue.add(op)
Adds an operation to the queue. If nothing is currently executing, it will execute immediately (and

**Kind**: instance method of [<code>PromiseQueue</code>](#PromiseQueue)  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>function</code> | The operation to add to the queue. |

<a name="PromiseQueue+removeAll"></a>

### promiseQueue.removeAll()
Removes all pending promises from the queue.

**Kind**: instance method of [<code>PromiseQueue</code>](#PromiseQueue)  
<a name="ERROR_TIMEOUT"></a>

## ERROR\_TIMEOUT
Value passed to fail() handlers that have been triggered due to withTimeout()'s timeout

**Kind**: global variable  
<a name="doInParallel"></a>

## doInParallel(items, beginProcessItem, failFast) ⇒ <code>$.Promise</code>
Executes a series of tasks in parallel, returning a "master" Promise that is resolved once

**Kind**: global function  

| Param | Type |
| --- | --- |
| items | <code>Array.&lt;\*&gt;</code> | 
| beginProcessItem | <code>function</code> | 
| failFast | <code>boolean</code> | 

<a name="doSequentially"></a>

## doSequentially(items, beginProcessItem, failAndStopFast) ⇒ <code>$.Promise</code>
Executes a series of tasks in serial (task N does not begin until task N-1 has completed).

**Kind**: global function  

| Param | Type |
| --- | --- |
| items | <code>Array.&lt;\*&gt;</code> | 
| beginProcessItem | <code>function</code> | 
| failAndStopFast | <code>boolean</code> | 

<a name="doSequentiallyInBackground"></a>

## doSequentiallyInBackground(items, fnProcessItem, [maxBlockingTime], [idleTime]) ⇒ <code>$.Promise</code>
Executes a series of synchronous tasks sequentially spread over time-slices less than maxBlockingTime.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array.&lt;\*&gt;</code> |  |
| fnProcessItem | <code>function</code> | Function that synchronously processes one item |
| [maxBlockingTime] | <code>number</code> |  |
| [idleTime] | <code>number</code> |  |

<a name="firstSequentially"></a>

## firstSequentially(items, beginProcessItem) ⇒ <code>$.Promise</code>
Executes a series of tasks in serial (task N does not begin until task N-1 has completed).

**Kind**: global function  

| Param | Type |
| --- | --- |
| items | <code>Array.&lt;\*&gt;</code> | 
| beginProcessItem | <code>function</code> | 

<a name="doInParallel_aggregateErrors"></a>

## doInParallel\_aggregateErrors(items, beginProcessItem) ⇒ <code>$.Promise</code>
Executes a series of tasks in parallel, saving up error info from any that fail along the way.

**Kind**: global function  

| Param | Type |
| --- | --- |
| items | <code>Array.&lt;\*&gt;</code> | 
| beginProcessItem | <code>function</code> | 

<a name="withTimeout"></a>

## withTimeout(promise, timeout, [resolveTimeout]) ⇒ <code>$.Promise</code>
Adds timeout-driven termination to a Promise: returns a new Promise that is resolved/rejected when

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| promise | <code>$.Promise</code> |  |
| timeout | <code>number</code> |  |
| [resolveTimeout] | <code>boolean</code> | If true, then resolve deferred on timeout, otherwise reject. Default is false. |

<a name="waitForAll"></a>

## waitForAll(promises, [failOnReject], [timeout]) ⇒ <code>$.Promise</code>
Allows waiting for all the promises to be either resolved or rejected.

**Kind**: global function  
**Returns**: <code>$.Promise</code> - A Promise which will be resolved once all dependent promises are resolved.

| Param | Type | Description |
| --- | --- | --- |
| promises | <code>Array.&lt;$.Promise&gt;</code> | Array of promises to wait for |
| [failOnReject] | <code>boolean</code> | Whether to reject or not if one of the promises has been rejected. |
| [timeout] | <code>number</code> | Number of milliseconds to wait until rejecting the promise |

<a name="chain"></a>

## chain(functions, args) ⇒ <code>jQuery.Promise</code>
Chains a series of synchronous and asynchronous (jQuery promise-returning) functions

**Kind**: global function  
**Returns**: <code>jQuery.Promise</code> - A promise that resolves with the result of the final call, or

| Param | Type | Description |
| --- | --- | --- |
| functions | <code>Array.&lt;function(\*)&gt;</code> | Functions to be chained |
| args | <code>Array</code> | Arguments to call the first function with |

<a name="promisify"></a>

## promisify(obj, method, ...varargs) ⇒ <code>$.Promise</code>
Utility for converting a method that takes (error, callback) to one that returns a promise;

**Kind**: global function  
**Returns**: <code>$.Promise</code> - A promise that is resolved with the arguments that were passed to the

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to call the method on. |
| method | <code>string</code> | The name of the method. The method should expect the errback      as its last parameter. |
| ...varargs | <code>Object</code> | The arguments you would have normally passed to the method      (excluding the errback itself). |
