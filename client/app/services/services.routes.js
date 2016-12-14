'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('services', {
    url: '/services',
    template: '<services></services>'
  });
}
