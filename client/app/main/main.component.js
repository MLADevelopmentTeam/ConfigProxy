import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  platforms = ['iOS', 'Android'];
  model = {
    client: window.localStorage.getItem('client') || '',
    platform: window.localStorage.getItem('platform') || ''
  };
  error = null;
  message = null;

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  addNewValue(outer) {
    outer.value.splice(0, 0, {
      key: 'Newbie',
      value: 'A whole lot of value'
    });
  }
  platformSelected() {
    this.$http.get(`/api/configs/${this.model.client}/${this.model.platform}`)
    .then(response => {
      window.localStorage.setItem('client', this.model.client);
      window.localStorage.setItem('platform', this.model.platform);
      this.error = null;
      this.message = [];
      for(var prop in response.data) {
        var type = response.data[prop];
        var inner = [];
        for(var p in type) {
          var o = {
            key: p,
            value: type[p]
          };
          inner.push(o);
        }
        this.message.push({
          key: prop,
          value: inner
        });
      }
    }, error => {
      this.message = null;
      this.error = `Could not find the client ${this.model.client}`;
      console.error(error);
    });
  }

  $onInit() {
    this.platformSelected();
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
      });
  }
}

export default angular.module('gitHubApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
