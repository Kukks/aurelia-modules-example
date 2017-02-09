import {
  RegisteredModule,
  ModuleConfiguration,
  InstancedModule,
  AureliaModuleInitializer
} from "./module.models";
import {RouteConfig} from "aurelia-router";

export class ModuleManager {
  private static registeredModules: RegisteredModule[] = [];

  public static fullModuleConfiguration: ModuleConfiguration;
  public static unknownRouteModule: string;

  public static registerModule(name: string,
                               routes: RouteConfig[],
                               module: AureliaModuleInitializer,
                               path: string = undefined): void {
    this.registeredModules.push({name, module, routes, path});
  }

  public registerModule(name: string,
                        routes: RouteConfig[],
                        module: AureliaModuleInitializer, path: string = undefined): void {
    ModuleManager.registerModule(name, routes, module, path);
  }

  public getModuleConfiguration(name?: string, config?: ModuleConfiguration): ModuleConfiguration {
    if (!config) {
      return ModuleManager.fullModuleConfiguration;
    }
    if (name && config.children) {
      return config.children.find((moduleConfig: ModuleConfiguration) => {
        return moduleConfig.module === name;
      });
    } else {
      return config;
    }
  }

  public getModule(module: string): RegisteredModule {
    return ModuleManager.registeredModules.find((registeredModule: RegisteredModule) => {
      return registeredModule.name === module;
    });
  }

  public getInstancedModule(moduleName: string, config?: ModuleConfiguration): InstancedModule {
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

  public getChildModules(moduleConfiguration: ModuleConfiguration): InstancedModule[] {
    let result: InstancedModule[] = [];
    if (moduleConfiguration.children && moduleConfiguration.children.length > 0) {
      for (let childModule of moduleConfiguration.children) {
        const module = this.getModule(childModule.module);
        if (module) {
          result.push(
            {
              module,
              config: childModule
            }
          );
        }
      }
    }

    if (moduleConfiguration.module !== ModuleManager.unknownRouteModule) {
      if (!result.find((im: InstancedModule) => {
          return im.module.name === ModuleManager.unknownRouteModule;
        })) {
        const unknownModule = this.getInstancedModule(ModuleManager.unknownRouteModule, {
          module: ModuleManager.unknownRouteModule,
          route: "404"
        });
        result.push(unknownModule);

      }
    }
    return result;
  }
}
