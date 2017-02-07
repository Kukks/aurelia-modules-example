import {RouteConfig} from "aurelia-router";

export type AureliaModuleInitializer = (...args: any[]) => AureliaModule;

export interface ModuleConfiguration {
  identifier?: string;
  route?: string | string[];
  title?: string;
  viewPorts?: ViewportConfiguration[];
  module: string;
  children?: ModuleConfiguration[];
}

export interface RegisteredModule {
  name: string;
  path: string;
  routes: RouteConfig[];
  module: AureliaModuleInitializer;
}

export interface InstancedModule {
  module: RegisteredModule;
  config: ModuleConfiguration;
}

export interface AureliaModule extends Object {
  childModules: InstancedModule[];
  getModuleName(): string;
  getRoutes(): RouteConfig[];
}

export interface ViewportConfiguration {
  name: string;
  module: string;
}
