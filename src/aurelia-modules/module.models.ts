import {RouteConfig} from "aurelia-router";

export type AureliaModuleInitializer = (...args: any[]) => IAureliaModule;

export interface IModuleConfiguration {
  identifier?: string;
  route?: string;
  title?: string;
  viewPorts?: {name:string, module:string}[];
  module: string;
  children?: IModuleConfiguration[];
}

export interface IRegisteredModule {
  name: string;
  asPlugin: boolean;
  routes:RouteConfig[];
  module: AureliaModuleInitializer;
}

export interface InstancedModule {
  module: IRegisteredModule;
  config: IModuleConfiguration;
}

export interface IAureliaModule extends  Object{
  childModules: InstancedModule[];
  getModuleName(): string;
  getRoutes(): RouteConfig[];
}
