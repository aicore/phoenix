### Import :
```js
const PerfUtils = brackets.getModule("utils/PerfUtils")
```

<a name="_"></a>

## \_
This is a collection of utility functions for gathering performance data.

**Kind**: global variable  
<a name="enabled"></a>

## enabled : <code>boolean</code>
Flag to enable/disable performance data gathering. Default is true (enabled)

**Kind**: global variable  
<a name="perfData"></a>

## perfData
Performance data is stored in this hash object. The key is the name of the

**Kind**: global variable  
<a name="activeTests"></a>

## activeTests
Active tests. This is a hash of all tests that have had markStart() called,

**Kind**: global variable  
<a name="updatableTests"></a>

## updatableTests
Updatable tests. This is a hash of all tests that have had markStart() called,

**Kind**: global variable  
<a name="createPerfMeasurement"></a>

## createPerfMeasurement(id, name)
Create a new PerfMeasurement key. Adds itself to the module export.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Unique ID for this measurement name |
| name | <code>name</code> | A short name for this measurement |

<a name="markStart"></a>

## markStart(name) ⇒ <code>Object</code> \| <code>Array.&lt;Object&gt;</code>
Start a new named timer. The name should be as descriptive as possible, since

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>Array.&lt;Object&gt;</code> - Opaque timer id or array of timer ids.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Single name or an Array of names. |

<a name="addMeasurement"></a>

## addMeasurement(id)
Stop a timer and add its measurements to the performance data.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | Timer id. |

<a name="updateMeasurement"></a>

## updateMeasurement(id)
This function is similar to addMeasurement(), but it allows timing the

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | Timer id. |

<a name="finalizeMeasurement"></a>

## finalizeMeasurement(id)
Remove timer from lists so next action starts a new measurement

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | Timer id. |

<a name="isActive"></a>

## isActive(id) ⇒ <code>boolean</code>
Returns whether a timer is active or not, where "active" means that

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether a timer is active or not.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | Timer id. |

<a name="getValueAsString"></a>

## getValueAsString(entry, aggregateStats) ⇒ <code>String</code>
return single value, or comma separated values for an array or return aggregated values with

**Kind**: global function  
**Returns**: <code>String</code> - a single value, or comma separated values in an array or

| Param | Type | Description |
| --- | --- | --- |
| entry | <code>Array</code> | An array or a single value |
| aggregateStats | <code>Boolean</code> | If set, the returned value will be aggregated in the form -                                   "min(avg)max[standard deviation]" |

<a name="getDelimitedPerfData"></a>

## getDelimitedPerfData() ⇒ <code>string</code>
Returns the performance data as a tab delimited string

**Kind**: global function  
<a name="getData"></a>

## getData(id)
Returns the measured value for the given measurement name.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | The measurement to retreive. |

<a name="getHealthReport"></a>

## getHealthReport() ⇒ <code>Object</code>
Returns the Performance metrics to be logged for health report

**Kind**: global function  
**Returns**: <code>Object</code> - An object with the health data logs to be sent  
<a name="clear"></a>

## clear()
Clear all logs including metric data and active tests.

**Kind**: global function  