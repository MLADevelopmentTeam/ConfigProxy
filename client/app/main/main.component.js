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
  constructor($http, $uibModal) {
    this.$http = $http;
    this.$uibModal = $uibModal;
  }

  addNewValue(outer) {
    outer.value.splice(0, 0, {
      key: 'new_key',
      value: 'A whole lot of value',
      isNew: true
    });
  }

  save() {
    var builtJSON = {};
    this.message.forEach(element => {
      var inner = {};
      element.value.forEach(ie => {
        inner[ie.key] = ie.value;
      });
      builtJSON[element.key] = inner;
    });
    var modal = this.$uibModal.open({
      templateUrl: 'app/main/spinner.html',
      backdrop: 'static'
    });
    this.$http.post(`/config/combined/${this.model.client}/${this.model.platform}`, {
      document: builtJSON
    }).then(response => {
      this.awesomeThings = response.data.result;
      modal.close();
    }, error => {
      modal.close();
    });
  }

  clone() {
    this._notImplemented();
  }

  sync() {
    this._notImplemented();
  }

  remove(outer, inner) {
    var innerArray = this.message[this.message.indexOf(outer)].value;
    var index = innerArray.indexOf(inner);
    innerArray.splice(index, 1);
  }

  load(thing) {
    this.model.client = thing.client;
    this.model.platform = thing.platform;
    this.platformSelected();
  }

  _notImplemented() {
    this.$uibModal.open({
      templateUrl: 'app/main/modal.html',
      backdrop: true
    });
  }

  platformSelected() {
    this.$http.get(`/config/combined/${this.model.client}/${this.model.platform}`)
    .then(response => {
      window.localStorage.setItem('client', this.model.client);
      window.localStorage.setItem('platform', this.model.platform);
      this.error = null;
      this.message = [];
      this.model.cloneClient = this.model.client;
      this.model.clonePlatform = this.platforms.filter(p => p != this.model.platform)[0];
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
    this.$http.get('/config')
      .then(response => {
        this.awesomeThings = response.data.result;
      });
  }
}

export default angular.module('configProxy.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
