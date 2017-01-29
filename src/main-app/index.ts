import {RouteConfig} from "aurelia-router";
import {autoinject} from "aurelia-dependency-injection";
import {FrameworkConfiguration} from "aurelia-framework";
import {BaseAureliaModule, module} from "../aurelia-modules/index";

@autoinject()
@module("main-app")
export class MainApplication extends BaseAureliaModule  {
  public getModuleName(): string {
    return "main-app";
  }
  public getRoutes(): RouteConfig[] {
    return [
      {
        name: "home",
        title: "home",
        route: "/",
        nav: true,
        moduleId: "./pages/home"
      },
      ...super.getRoutes()
    ];
  };

}

export function configure(config: FrameworkConfiguration) {
  //config.globalResources([]);
}

