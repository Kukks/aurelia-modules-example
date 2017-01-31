import {Aurelia} from 'aurelia-framework'
import environment from './environment';
import {IModuleConfiguration} from "./aurelia-modules/module.models";

//Configure Bluebird Promises.
(<any>Promise).config({
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia: Aurelia) {
  const moduleConfiguration: IModuleConfiguration = {
    module: "main-app",
    identifier: "official-main-app",
    title: "App entry point",
    children: [
      {
        module: "main-app",
        identifier: "second-main-app-2",
        title: "second App entry point in second",
        children: [{
          module: "main-app",
          identifier: "third-main-app",
          title: "third App entry point",
          children: []
        }]
      },
      {
        module: "main-app",
        identifier: "second-main-app",
        title: "second App entry point",
        route: "alternate-route-to-module",
        children: [{
          module: "main-app",
          identifier: "third-main-app",
          title: "third App entry point",
          children: []
        }]
      }
    ]
  };

  aurelia.use
    .standardConfiguration()
    .plugin('aurelia-repeat-strategies')
    .feature('main-app')
    .feature('aurelia-modules', moduleConfiguration);

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() =>
    aurelia.setRoot("main-app/index", document.body));
}
