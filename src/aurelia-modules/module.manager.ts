import {
  IRegisteredModule,
  IAureliaModule,
  IModuleConfiguration,
  InstancedModule,
  AureliaModuleInitializer
} from "./module.models";
import {RouteConfig} from "aurelia-router";

export class ModuleManager {
  private static registeredModules: IRegisteredModule[] = [];

  public static fullModuleConfiguration: IModuleConfiguration;

  public static registerModule(name: string,routes: RouteConfig[], module: AureliaModuleInitializer, asPlugin: boolean = false): void {
    this.registeredModules.push({name, module,routes, asPlugin: false});
  }

  public registerModule(name: string,routes: RouteConfig[], module: AureliaModuleInitializer, asPlugin: boolean = false): void {
    ModuleManager.registerModule(name, routes,module, asPlugin);
  }

  public getModuleConfiguration(name?: string, config?: IModuleConfiguration): IModuleConfiguration {
    if (!config) {
      return ModuleManager.fullModuleConfiguration;
    }
    if (name) {
      return config.children.find((moduleConfig: IModuleConfiguration) => {
        return moduleConfig.module === name;
      })
    } else {
      return config[0];
    }
  }

  public getModule(module: string): IRegisteredModule {
    return ModuleManager.registeredModules.find((registeredModule: IRegisteredModule) => {
      return registeredModule.name === module;
    });
  }

  public getInstancedModule(moduleName:string, config?: IModuleConfiguration):InstancedModule{
    const registeredModule = this.getModule(moduleName);
    const moduleConfig = this.getModuleConfiguration(moduleName, config);
    if (registeredModule) {
      return {
          module: registeredModule,
          config: moduleConfig
        };
    }
    return null;
  }

  public getChildModules(moduleConfiguration: IModuleConfiguration): InstancedModule[] {
    let result: InstancedModule[] = [];
    if (moduleConfiguration.children && moduleConfiguration.children.length > 0) {
      for (let childModule of moduleConfiguration.children) {
        const module = this.getModule(childModule.module);
        if (module) {
          result.push(
            {
              module: module,
              config: childModule
            }
          );
        }
      }
    }
    return result;
  }
}

