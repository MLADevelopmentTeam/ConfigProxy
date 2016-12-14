import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './services.routes';

export class ServicesController {
  services = [];
  template = null;
  model = null;
  intercepts = [];
  /*@ngInject*/
  constructor($http, Modal) {
    this.$http = $http;
    this.Modal = Modal;
  }
  load(service) {
    var modal = this.Modal.alert.spinner();
    this.$http.get(`/axes103/rest/templates/${service.id}`)
      .then(response => {
        var model = {
          name: null,
          uri: response.data.uri,
          response: JSON.stringify(response.data.response, null, 4)
        };
        this.model = model;
        this.template = model;
        modal.close();
      });
    this.$http.get(`/axes103/rest/intercept?uri=${encodeURIComponent(service.uri)}`)
      .then(response => {
        this.intercepts = response.data;
      });
  }
  editIntercept(intercept) {
    this.model = intercept;
  }
  enableIntercept(intercept) {
    intercept.active = !intercept.active;
    var modal = this.Modal.alert.spinner();
    this.$http.post('/axes103/rest/intercept', intercept)
      .then(response => {
        modal.close();
        this.intercepts = response.data;
      });
  }
  createIntercept() {
    var modal = this.Modal.alert.spinner();
    this.$http.post('/axes103/rest/intercept', this.model)
      .then(response => {
        modal.close();
        this.intercepts = response.data;
      });
  }
  deleteIntercept() {
    var modal = this.Modal.alert.spinner();
    this.$http.delete(`/axes103/rest/intercept/${this.model._id}?uri=${encodeURIComponent(this.model.uri)}`)
      .then(response => {
        modal.close();
        this.intercepts = response.data;
        this.model = this.template;
      });
  }
  resetIntercept() {
    this.model = this.template;
  }
  $onInit() {
    this.$http.get('/axes103/rest/templates')
      .then(response => {
        this.services = response.data;
      });
  }
}

export default angular.module('configProxy.services', [uiRouter])
  .config(routing)
  .component('services', {
    template: require('./services.html'),
    controller: ServicesController
  })
  .name;
