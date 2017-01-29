import {ModuleManager} from "./module.manager";

export function module<T>(name: string): ClassDecorator{
  return <AureliaModuleInitializer>(target: AureliaModuleInitializer) => {
    if(target){
      ModuleManager.registerModule(name, <any>target);
    }
    return target;
  }
}
