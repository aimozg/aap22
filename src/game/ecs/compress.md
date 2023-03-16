Compresssion schema.

primitive types: bit, uint8, int8, uint16, int16, uint32, int32, float64

```
Document =
     uint32 magic
     uint32 version
     Array<String> strings
     Entity root
Entity =
     StringRef clsid
     StringRef bpid
     uint32 uuid
     Map<StringRef, Any> stats
     Array<Entity> components
     Array<Entity> effects
     Array<Tuple<Any, Entity>> children
     Map<StringRef, Any> data
StringRef = uint32
Map<K,V> = Array<Tuple<K,V>>
Tuple<A,B,...> =
     A component1
     B component2
     ...
Array<K> =
     Integer length
     K[] elements
String =
     Integer length
     uint8[] utf8data
Integer = 
    bit continuation
    bit sign
    bit[6] value
    { bit continuation, bit[7] value}[]
Any =
     int8 type
         0: undefined
         1: null
         2: true
         3: false
         4: integer
         5: number
         6: string
         7: array
         8: object
         9: integer[]
     Integer | Number | StringRef | Array<Any> | Map<StringRef,Any> | void
```
