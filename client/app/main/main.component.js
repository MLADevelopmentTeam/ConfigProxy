import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  platforms = ['ios', 'android'];
  model = {
    client: window.localStorage.getItem('client') || null,
    platform: window.localStorage.getItem('platform') || null,
    cloneName: null
  };
  error = null;
  message = null;

  /*@ngInject*/
  constructor($http, $uibModal, $location, Modal) {
    this.$http = $http;
    this.Modal = Modal;
    this.style = $location.search().NeedsMoreCats ? 'background-image:url(http://lorempixel.com/1920/1080/cats/)' : '';
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
    var modal = this.Modal.alert.spinner();
    this.$http.post(`/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`, {
      document: builtJSON
    }).then(response => {
      this.awesomeThings = response.data.result;
      modal.close();
    }, error => {
      modal.close();
    });
  }

  clone() {
    var builtJSON = {};
    this.message.forEach(element => {
      var inner = {};
      element.value.forEach(ie => {
        inner[ie.key] = ie.value;
      });
      builtJSON[element.key] = inner;
    });
    var modal = this.Modal.alert.spinner();
    this.$http.post(`/MLS${this.model.cloneName}/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`, {
      document: builtJSON
    }).then(response => {
      this.awesomeThings = response.data.result;
      this.model.client = `MLS${this.model.cloneName}`;
      this.model.cloneName = null;
      modal.close();
    }, error => {
      modal.close();
    });
  }

  sync() {
    this._notImplemented('sync');
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

  _notImplemented(func) {
    this.Modal.alert.notImplemented(func);
  }

  removeOverride() {
    var modal = this.Modal.alert.spinner();
    this.$http.delete(`/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`)
    .then(response => {
      this.awesomeThings = response.data.result;
      modal.close();
    }, error => {
      console.error(error);
      modal.close();
    });
  }

  platformSelected() {
    var modal = this.Modal.alert.spinner();
    this.$http.get(`/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`)
    .then(response => {
      window.localStorage.setItem('client', this.model.client);
      window.localStorage.setItem('platform', this.model.platform);
      this.error = null;
      this.message = response.data;
      this.model.cloneName = null;
      modal.close();
    }, error => {
      this.message = null;
      this.error = `Could not find the client ${this.model.client || '"unknown"'}`;
      console.error(error);
      modal.close();
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
