import {FrameworkConfiguration} from "aurelia-framework";
import {ModuleConfiguration} from "./module.models";
import {ModuleManager} from "./module.manager";
export * from "./base-aurelia-module";
export * from "./module.decorator";
export * from "./module.manager";
export * from "./module.models";

export function configure(config: FrameworkConfiguration,
                          moduleConfiguration: ModuleConfiguration | (() => ModuleConfiguration),
                          unknownRouteModule: string = null) {
  switch (typeof moduleConfiguration) {
    case "object":
      ModuleManager.fullModuleConfiguration = moduleConfiguration as ModuleConfiguration;
      break;
    case "function":
      ModuleManager.fullModuleConfiguration = (moduleConfiguration as () => ModuleConfiguration)();
      break;
    default:
      break;
  }

  if (unknownRouteModule) {
    ModuleManager.unknownRouteModule = unknownRouteModule;
  }
}
