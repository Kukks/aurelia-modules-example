import {FrameworkConfiguration} from "aurelia-framework";
import {IModuleConfiguration} from "./module.models";
import {ModuleManager} from "./module.manager";
export * from "./base-aurelia-module";
export * from "./module.decorator";
export * from "./module.manager";
export * from "./module.models";

export function configure(config: FrameworkConfiguration, moduleConfiguration: IModuleConfiguration) {
  ModuleManager.fullModuleConfiguration = moduleConfiguration;
}
