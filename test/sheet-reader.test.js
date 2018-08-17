/* eslint-env mocha */

'use strict';

const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const sugar = require('sugar-date');
const sheetReader = require('../sheet-reader');

describe('sheet-reader', function () {
  before(function () {
    this.sinon = sinon.sandbox.create();
    this.sinon.useFakeTimers(Date.UTC(2015, 9, 14));
    sugar.Date.newDateInternal = function () { return new Date(); }; // Note: make sugar-date use the faked timer from sinon
    this.objectInput = {
      customer: [
        ['id', 'name', 'owner:customer:ref', 'address', 'created:date', 'timezone:created:tz'],
        ['irma', 'Irma ', 'coop', 'Glostrup', '1886-08-23T17:43:00Z', ''],
        ['coop', 'COOP', '', 'Albertslund', '2 days ago', ''],
        ['fakta', 'Fakta', 'coop', '', '', ''],
        ['netto', 'Døgn Netto', '', '', '2015-09-14 09:00:00', 'Europe/Copenhagen']
      ],
      product: [
        ['id', 'name', 'type'],
        ['apple', 'Apple', 'fruit']
      ],
      orderItem: [
        ['customer:ref', 'product:ref', 'quantity:num', 'price:num'],
        ['irma', 'apple', '200', 'expect:12.75'],
        ['coop', 'apple', '100']
      ]
    };
    this.data = {
      file: sheetReader.readFile('test/data/sheet-reader.ods'),
      object: sheetReader.build(this.objectInput)
    };
    this.dataWithoutMetadata = {
      file: sheetReader.readFile('test/data/sheet-reader.ods', {excludeMetadata: true}),
      object: sheetReader.build(this.objectInput, {excludeMetadata: true})
    };
    this.trimmedData = {
      file: sheetReader.readFile('test/data/sheet-reader.ods', {trim: true}),
      object: sheetReader.build(this.objectInput, {trim: true})
    };
  });

  after(function () {
    delete sugar.Date.newDateInternal;
    this.sinon.restore();
  });

  ['file', 'object'].forEach(source => {
    describe('when created from ' + source, function () {
      beforeEach(function () {
        const orderItemIds = Object.keys(this.data[source].orderItem);
        this.irmaApples = orderItemIds[0];
        this.coopApples = orderItemIds[1];
      });

      it('should support string values', function () {
        this.data[source].customer['irma'].address.value.should.equal('Glostrup');
      });

      it('should support date values', function () {
        this.data[source].customer['irma'].created.value.should.equal(Date.UTC(1886, 7, 23, 17, 43));
      });

      it('should support date with timezone values', function () {
        this.data[source].customer['netto'].timezone.value.should.equal('Europe/Copenhagen');
        this.data[source].customer['netto'].created.value.should.equal(Date.UTC(2015, 8, 14, 7, 0)); // Note: two hours before, because of timezone and DST
      });

      it('should support relative date values', function () {
        const coopCreated = new Date(this.data[source].customer['coop'].created.value);
        coopCreated.getUTCFullYear().should.equal(2015);
        coopCreated.getUTCMonth().should.equal(9);
        coopCreated.getUTCDate().should.equal(12);
      });

      it('should support self references', function () {
        this.data[source].customer['irma'].owner.value.should.equal('coop');
        this.data[source].customer['irma'].owner.reference(this.data[source]).address.value.should.equal('Albertslund');
      });

      it('should support empty cells', function () {
        should.not.exist(this.data[source].customer['coop'].owner.value);
        should.not.exist(this.data[source].customer['fakta'].address.value);
      });

      it('should support multiple sheets', function () {
        this.data[source].product['apple'].type.value.should.equal('fruit');
      });

      it('should ignore empty rows', function () {
        Object.keys(this.data[source].product).should.deep.equal(['apple']);
      });

      it('should ignore comment rows', function () {
        Object.keys(this.data[source].customer).sort().should.deep.equal(['coop', 'fakta', 'irma', 'netto']);
      });

      it('should support references to other sheets', function () {
        this.data[source].orderItem[this.irmaApples].customer.value.should.equal('irma');
        this.data[source].orderItem[this.irmaApples].customer.reference(this.data[source]).address.value.should.equal('Glostrup');
      });

      it('should support numeric values', function () {
        this.data[source].orderItem[this.coopApples].quantity.value.should.equal(100);
      });

      it('should support expected values', function () {
        should.not.exist(this.data[source].orderItem[this.irmaApples].price.value);
        this.data[source].orderItem[this.irmaApples].price.expect.should.equal(12.75);
      });

      it('should not store data by row number', function () {
        should.not.exist(this.data[source].customer[1]);
      });

      it('should not store data by raw column name', function () {
        should.not.exist(this.data[source].customer['irma']['owner:customer:ref']);
      });

      it('should exclude metadata, useful for diffing', function () {
        this.dataWithoutMetadata[source].orderItem[0].should.deep.equal({
          customer: { value: 'irma' },
          product: { value: 'apple' },
          quantity: { value: '200' },
          price: { expect: '12.75' }});
      });

      it('should not trim white space', function () {
        this.data[source].customer['irma']['name'].value.should.equal('Irma ');
      });

      it('should trim white space, but not remove spaces', function () {
        this.trimmedData[source].customer['irma']['name'].value.should.equal('Irma');
        this.trimmedData[source].customer['netto']['name'].value.should.equal('Døgn Netto');
      });
    });
  });

  describe('error handling', function () {
    describe('outrageous range in sheet', function () {
      it('should throw an error', function () {
        this.timeout(30000); // Note: the xlsx module takes a long time to parse this small file
        (() => sheetReader.readFile('test/data/bad.xlsx')).should.throw('Sheet "content" has a much larger range "A1:L1048576" than the row count of "2"');
      });
    });
  });

  describe('files with header only', function () {
    it('should do just fine', function () {
      const file = sheetReader.readFile('test/data/worse.xlsx', {trim: true});
      file.should.deep.equal({content: {}});
    });
  });
});
