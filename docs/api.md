# TOC
   - [sheet-reader](#sheet-reader)
     - [when created from file](#sheet-reader-when-created-from-file)
     - [when created from object](#sheet-reader-when-created-from-object)
<a name=""></a>
 
<a name="sheet-reader"></a>
# sheet-reader
<a name="sheet-reader-when-created-from-file"></a>
## when created from file
should support string values.

```js
this.data[source].customer['irma'].address.value.should.equal('Glostrup');
```

should support date values.

```js
this.data[source].customer['irma'].created.value.should.equal(Date.UTC(1886, 7, 23, 17, 43));
```

should support relative date values.

```js
const coopCreated = new Date(this.data[source].customer['coop'].created.value);
coopCreated.getUTCFullYear().should.equal(2015);
coopCreated.getUTCMonth().should.equal(9);
coopCreated.getUTCDate().should.equal(12);
```

should support self references.

```js
this.data[source].customer['irma'].owner.value.should.equal('coop');
this.data[source].customer['irma'].owner.reference(this.data[source]).address.value.should.equal('Albertslund');
```

should support empty cells.

```js
should.not.exist(this.data[source].customer['coop'].owner.value);
should.not.exist(this.data[source].customer['fakta'].address.value);
```

should support multiple sheets.

```js
this.data[source].product['apple'].type.value.should.equal('fruit');
```

should support references to other sheets.

```js
this.data[source].orderItem[this.irmaApples].customer.value.should.equal('irma');
this.data[source].orderItem[this.irmaApples].customer.reference(this.data[source]).address.value.should.equal('Glostrup');
```

should support numeric values.

```js
this.data[source].orderItem[this.coopApples].quantity.value.should.equal(100);
```

should support expected values.

```js
should.not.exist(this.data[source].orderItem[this.irmaApples].price.value);
this.data[source].orderItem[this.irmaApples].price.expect.should.equal(12.75);
```

should not store data by row number.

```js
should.not.exist(this.data[source].customer[1]);
```

should not store data by raw column name.

```js
should.not.exist(this.data[source].customer['irma']['owner:customer:ref']);
```

<a name="sheet-reader-when-created-from-object"></a>
## when created from object
should support string values.

```js
this.data[source].customer['irma'].address.value.should.equal('Glostrup');
```

should support date values.

```js
this.data[source].customer['irma'].created.value.should.equal(Date.UTC(1886, 7, 23, 17, 43));
```

should support relative date values.

```js
const coopCreated = new Date(this.data[source].customer['coop'].created.value);
coopCreated.getUTCFullYear().should.equal(2015);
coopCreated.getUTCMonth().should.equal(9);
coopCreated.getUTCDate().should.equal(12);
```

should support self references.

```js
this.data[source].customer['irma'].owner.value.should.equal('coop');
this.data[source].customer['irma'].owner.reference(this.data[source]).address.value.should.equal('Albertslund');
```

should support empty cells.

```js
should.not.exist(this.data[source].customer['coop'].owner.value);
should.not.exist(this.data[source].customer['fakta'].address.value);
```

should support multiple sheets.

```js
this.data[source].product['apple'].type.value.should.equal('fruit');
```

should support references to other sheets.

```js
this.data[source].orderItem[this.irmaApples].customer.value.should.equal('irma');
this.data[source].orderItem[this.irmaApples].customer.reference(this.data[source]).address.value.should.equal('Glostrup');
```

should support numeric values.

```js
this.data[source].orderItem[this.coopApples].quantity.value.should.equal(100);
```

should support expected values.

```js
should.not.exist(this.data[source].orderItem[this.irmaApples].price.value);
this.data[source].orderItem[this.irmaApples].price.expect.should.equal(12.75);
```

should not store data by row number.

```js
should.not.exist(this.data[source].customer[1]);
```

should not store data by raw column name.

```js
should.not.exist(this.data[source].customer['irma']['owner:customer:ref']);
```

