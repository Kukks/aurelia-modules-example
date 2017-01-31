import {ModuleManager} from "./module.manager";
import {RouteConfig} from "aurelia-router";

export function module<T>(name: string, routes: RouteConfig[] = []): ClassDecorator {
  return <AureliaModuleInitializer>(target: AureliaModuleInitializer) => {
    if (target) {
      ModuleManager.registerModule(name, routes, <any>target);
    }
    return target;
  }
}
