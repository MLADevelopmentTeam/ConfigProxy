'use strict';

import angular from 'angular';
import {
  UtilService
} from './util.service';

export default angular.module('configProxy.util', [])
  .factory('Util', UtilService)
  .name;
