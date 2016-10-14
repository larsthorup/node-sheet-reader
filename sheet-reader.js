'use strict';

const R = require('ramda');
const sugar = require('sugar-date');
const XLSX = require('xlsx');

function readFile (path) {
  const workbook = XLSX.readFile(path);
  const sheets = parseWorkbook(workbook);
  const columnHeaders = extractColumnHeaders(sheets);
  return parse(sheets, columnHeaders);
}

function parseWorkbook (workbook) {
  return R.fromPairs(workbook.SheetNames.map(sheetKey => {
    const workSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetKey]);
    const sheetValue = parseWorkSheet(workSheet);
    return [sheetKey, sheetValue];
  }));
}

function parseWorkSheet (workSheet) {
  return R.fromPairs(workSheet.map(row => {
    const rowKey = row.id;
    const rowValue = row;
    return [rowKey, rowValue];
  }));
}

function extractColumnHeaders (sheets) {
  const sheetKeys = Object.keys(sheets);
  return R.fromPairs(sheetKeys.map(sheetKey => {
    const sheet = sheets[sheetKey];
    const rowId = Object.keys(sheet)[0];
    const columnHeadersKey = sheetKey;
    const columnHeadersValue = Object.keys(sheet[rowId]);
    return [columnHeadersKey, columnHeadersValue];
  }));
}

function build (matrices) {
  const columnHeaders = buildColumnHeaders(matrices);
  const sheets = buildSheets(matrices, columnHeaders);
  return parse(sheets, columnHeaders);
}

function buildColumnHeaders (matrices) {
  const sheetKeys = Object.keys(matrices);
  return R.fromPairs(sheetKeys.map(sheetKey => {
    const columnHeadersKey = sheetKey;
    const columnHeadersValue = matrices[sheetKey][0];
    return [columnHeadersKey, columnHeadersValue];
  }));
}

function buildSheets (matrices, columnHeaders) {
  const sheetKeys = Object.keys(matrices);
  return R.fromPairs(sheetKeys.map(sheetKey => {
    const matrix = matrices[sheetKey];
    const sheetValue = buildSheet(matrix, columnHeaders[sheetKey]);
    return [sheetKey, sheetValue];
  }));
}

function buildSheet (matrix, columnHeaders) {
  const rows = matrix.slice(1);
  const pairs = rows.map((row) => {
    const rowValue = buildRow(row, columnHeaders);
    const rowKey = rowValue.id;
    return [rowKey, rowValue];
  });
  return R.fromPairs(pairs);
}

function buildRow (cellArray, columnHeaders) {
  return R.fromPairs(columnHeaders.map((columnHeader, columnIndex) => {
    const cellKey = columnHeader;
    const rawCellValue = cellArray[columnIndex];
    const cellValue = rawCellValue === '' ? undefined : rawCellValue;
    return [cellKey, cellValue];
  }));
}

function parse (sheets, columnHeaders) {
  const sheetKeys = Object.keys(sheets);
  return R.fromPairs(sheetKeys.map(sheetKey => {
    const sheetValue = makeSheet(sheets[sheetKey], columnHeaders[sheetKey]);
    return [sheetKey, sheetValue];
  }));
}

function makeSheet (sheet, columnHeaders) {
  const rowKeys = Object.keys(sheet);
  return R.fromPairs(rowKeys.map(rowKey => {
    const rowValue = makeRow(sheet, rowKey, columnHeaders);
    return [rowKey, rowValue];
  }));
}

function makeRow (sheet, rowId, columnHeaders) {
  const inputRow = sheet[rowId];
  return R.fromPairs(columnHeaders.map(columnHeader => {
    const value = inputRow[columnHeader];
    const metadata = parseMetadata(columnHeader, value);
    const cellKey = metadata.name;
    const cellValue = new Cell(metadata);
    return [cellKey, cellValue];
  }));
}

function parseMetadata (colHeader, cellValue) {
  const colHeaderParts = colHeader.split(':');
  const valueParts = cellValue !== undefined ? cellValue.split(':') : [];
  const name = colHeaderParts.length > 1 ? colHeaderParts[0] : colHeader;
  const type = colHeaderParts.length > 1 ? colHeaderParts[colHeaderParts.length - 1] : 'string';
  const propName = valueParts.length > 1 ? valueParts[0] : 'value';
  const value = valueParts.length > 1 ? valueParts[1] : cellValue;
  const sheetNameRef = type === 'ref' ? (colHeaderParts.length > 2 ? colHeaderParts[1] : name) : undefined;
  return {name, type, propName, value, sheetNameRef};
}

class Cell {
  constructor (metadata) {
    this.metadata = metadata;
    const value = convertValue(metadata);
    this[metadata.propName] = value;
  }

  reference (data) {
    return data[this.metadata.sheetNameRef][this.value];
  }
}

function convertValue (metadata) {
  if (metadata.value === undefined) {
    return null;
  } else {
    switch (metadata.type) {
      case 'string':
        return metadata.value;
      case 'num':
        return Number(metadata.value);
      case 'date':
        return sugar.Date.create(metadata.value, {fromUTC: true, setUTC: true}).getTime();
      case 'ref':
        const rowId = metadata.value;
        return rowId;
      default:
        throw new Error(`unknown type ${metadata.type}`);
    }
  }
}

module.exports = {
  readFile: readFile,
  build: build
};
