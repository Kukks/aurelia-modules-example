import {ModuleManager} from "./module.manager";
import {RouteConfig} from "aurelia-router";

export function module<T>(name: string, routes: RouteConfig[] = [], path: string = null): ClassDecorator {
  return <AureliaModuleInitializer>(target: AureliaModuleInitializer) => {
    if (target) {
      ModuleManager.registerModule(name, routes, <any>target, path);
    }
    return target;
  };
}
