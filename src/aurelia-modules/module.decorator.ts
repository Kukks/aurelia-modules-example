import {ModuleManager} from "./module.manager";
import {RouteConfig} from "aurelia-router";

export function module<T>(name: string, routes: RouteConfig[] = [], path: string = undefined, unknownModule: boolean = false): ClassDecorator {
  return <AureliaModuleInitializer>(target: AureliaModuleInitializer) => {
    if (target) {
      const regModule = ModuleManager.registerModule(name, routes, <any>target, path);
      if (unknownModule) {
        ModuleManager.unknownRouteModule = name;
      }
      Reflect.defineMetadata("module", regModule, target);
    }
    return target;
  };
}
