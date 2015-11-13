# node-sheet-reader

Easily use a spreadsheet as an input format for your app

## Purpose

For applications with complicated configuration data, 
it may make sense to keep the configuration data in a spreadsheet
format to postpone the task of creating an administration UI. 
Admin users can then use any spreadsheet tool to edit the 
configuration data in a somewhat userfriendly manner.

This library supports reading in data from a spreadsheet. 
The data is represented as 
a hash of sheets containing 
a hash of rows containing 
a hash of columns.

The library assumes a database like structure of the sheets in a spreadsheet file.
Each sheet must have one row at the top with column headers. 
Each sheet should have an "id" column to reference the rows.

The library reads cell values as strings, 
unless te column name is suffixed with a type.
The following types are supported:

* :date - the value will be parsed using "sugar-date" into a JavaScript timestamp
* :num - the value will be parsed as a number
* :<sheet>:ref - the value will stored as a reference to a row in the specified sheet.

The library supports reading sheets from a JavaScript object literal instead of a file
for use in unit testing code that depends on the sheet data structure.

## API

See test/sheet-reader.test.js and test/data/sheet-reader.ods for detailed examples