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
    this.data = {
      file: sheetReader.readFile('test/data/sheet-reader.ods'),
      object: sheetReader.build({
        customer: [
          ['id', 'name', 'owner:customer:ref', 'address', 'created:date'],
          ['irma', 'Irma', 'coop', 'Glostrup', '1886-08-23'],
          ['coop', 'COOP', '', 'Albertslund', '2 days ago'],
          ['fakta', 'Fakta', 'coop', '', '']
        ],
        product: [
          ['id', 'name', 'type'],
          ['apple', 'Apple', 'fruit']
        ],
        orderItem: [
          ['id', 'customer:ref', 'product:ref', 'quantity:num', 'price:num'],
          ['irma-apples', 'irma', 'apple', '200', 'expect:12.75']
        ]
      })
    };
  });

  after(function () {
    delete sugar.Date.newDateInternal;
    this.sinon.restore();
  });

  ['file', 'object'].forEach(source => {
    describe('when created from ' + source, function () {
      it('should support string values', function () {
        this.data[source].customer['irma'].address.value.should.equal('Glostrup');
      });

      it('should support date values', function () {
        this.data[source].customer['irma'].created.value.should.equal(Date.UTC(1886, 7, 23));
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

      it('should support references to other sheets', function () {
        this.data[source].orderItem['irma-apples'].customer.value.should.equal('irma');
        this.data[source].orderItem['irma-apples'].customer.reference(this.data[source]).address.value.should.equal('Glostrup');
      });

      it('should support numeric values', function () {
        this.data[source].orderItem['irma-apples'].quantity.value.should.equal(200);
      });

      it('should support expected values', function () {
        should.not.exist(this.data[source].orderItem['irma-apples'].price.value);
        this.data[source].orderItem['irma-apples'].price.expect.should.equal(12.75);
      });

      it('should not store data by row number', function () {
        should.not.exist(this.data[source].customer[1]);
      });

      it('should not store data by raw column name', function () {
        should.not.exist(this.data[source].customer['irma']['owner:customer:ref']);
      });
    });
  });
});