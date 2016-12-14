'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Top',
    state: 'Top'
  },
  {
    title: 'History',
    state: 'History'
  },
  {
    title: 'Content',
    state: 'Content'
  },
  {
    title: 'Style',
    state: 'Style'
  },
  {
    title: 'Functional',
    state: 'Functional'
  },
  {
    title: 'Services',
    state: 'Services'
  }];
  isCollapsed = true;

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
