'use strict';

let chai = require('chai');
let sinonChai = require('sinon-chai');
let chaiAsPromised = require('chai-as-promised');

// Chai setup
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
