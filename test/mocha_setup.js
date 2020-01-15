'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

// Chai setup
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
