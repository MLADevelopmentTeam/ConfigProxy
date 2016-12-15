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
  innerFilter = null;
  design = true;
  code = false;
  codeModel = '{}';
  numberOfRows = 30;

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

  modeChange(mode) {
    this.design = mode == 'design';
    this.code = mode == 'code';
    if(this.code) {
      this.codeModel = JSON.stringify(this.buildJSON(this.message), null, 4);
      this.numberOfRows = this.codeModel.split('\n').length + 100;
    } else {
      this.message = this.buildArray(this.codeModel);
    }
  }

  save() {
    var builtJSON = this._prepareForSave();
    var modal = this.Modal.alert.spinner();
    this.$http.post(`/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`, {
      document: builtJSON
    }).then(response => {
      this.awesomeThings = response.data.result;
      modal.close();
    }, () => {
      modal.close();
    });
  }

  clone() {
    var builtJSON = this._prepareForSave();
    var modal = this.Modal.alert.spinner();
    this.$http.post(`/MLS${this.model.cloneName}/config/combined/${this.model.client || undefined}/${this.model.platform || undefined}`, {
      document: builtJSON
    }).then(response => {
      this.awesomeThings = response.data.result;
      this.model.client = `MLS${this.model.cloneName}`;
      this.model.cloneName = null;
      modal.close();
    }, () => {
      modal.close();
    });
  }


  buildArray(code) {
    let obj = JSON.parse(code);
    let outer = [];
    for(var prop in obj) {
      var element = obj[prop];
      let inner = [];
      for(var innerProp in element) {
        var innerElement = element[innerProp];
        inner.push({
          key: innerProp,
          value: innerElement
        });
      }
      outer.push({
        key: prop,
        value: inner
      });
    }
    return outer;
  }

  buildJSON(message) {
    var builtJSON = {};
    message.forEach(element => {
      var inner = {};
      element.value.forEach(ie => {
        inner[ie.key] = ie.value;
      });
      builtJSON[element.key] = inner;
    });
    return builtJSON;
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

  _prepareForSave() {
    var builtJSON = null;
    if(this.code) {
      builtJSON = JSON.parse(this.codeModel);
      this.message = this.buildArray(this.codeModel);
    } else {
      builtJSON = this.buildJSON(this.message);
      this.codeModel = JSON.stringify(builtJSON, null, 4);
      this.numberOfRows = this.codeModel.split('\n').length + 100;
    }
    return builtJSON;
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
  .filter('newWithFilter', function() {
    return function(items, search) {
      var filtered = [];
      for(var i = 0; i < items.length; i++) {
        var item = items[i];
        if(!search || item.key.toLowerCase().includes(search.toLowerCase()) || item.isNew) {
          filtered.push(item);
        }
      }
      return filtered;
    };
  })
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
