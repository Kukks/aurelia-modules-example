import {RouteConfig} from "aurelia-router";

export type AureliaModuleInitializer = (...args: any[]) => IAureliaModule;

export interface IModuleConfiguration {
  identifier?: string;
  route?: string | string[];
  title?: string;
  viewPorts?: IViewportConfiguration[];
  module: string;
  href?: string;
  children?: IModuleConfiguration[];
}

export interface IRegisteredModule {
  name: string;
  path: string;
  routes: RouteConfig[];
  module: AureliaModuleInitializer;
}

export interface InstancedModule {
  module: IRegisteredModule;
  config: IModuleConfiguration;
}

export interface IAureliaModule extends Object {
  childModules: InstancedModule[];
  getModuleName(): string;
  getRoutes(): RouteConfig[];
}

export interface IViewportConfiguration {
  name: string;
  module: string;
}
