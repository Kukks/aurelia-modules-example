import {RouteConfig} from "aurelia-router";
import {autoinject} from "aurelia-dependency-injection";
import {FrameworkConfiguration} from "aurelia-framework";
import {BaseAureliaModule, module} from "../aurelia-modules/index";

const routes: RouteConfig[] = [{
  name: "home",
  title: "home",
  route: "/",
  nav: true,
  moduleId: "./pages/home"
}];

@autoinject()
@module("main-app", routes, )
export class MainApplication extends BaseAureliaModule {
  public getModuleName(): string {
    return "main-app";
  }
}

export function configure(config: FrameworkConfiguration) {
  config.globalResources('./resources/iterable-value-converter');
}

