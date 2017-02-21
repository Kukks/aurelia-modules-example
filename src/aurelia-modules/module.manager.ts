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
                               path: string = undefined): RegisteredModule {
    const regModule: RegisteredModule = {name, module, routes, path};
    this.registeredModules.push(regModule);
    return regModule;
  }

  public registerModule(name: string,
                        routes: RouteConfig[],
                        module: AureliaModuleInitializer, path: string = undefined): void {
    ModuleManager.registerModule(name, routes, module, path);
  }

  private getModuleConfigurationFromChildren(name: string, childrenConfig: ModuleConfiguration[]): ModuleConfiguration {
    let result = null;
    for (let moduleConfig of childrenConfig) {
      const childConfig = this.getModuleConfiguration(name, moduleConfig);
      if (childConfig) {
        result = childConfig;
        break;
      }
    }
    return result;
  }

  public getModuleConfiguration(name?: string, config?: ModuleConfiguration): ModuleConfiguration {
    if (!config && (ModuleManager.fullModuleConfiguration.module === name || !name)) {
      return ModuleManager.fullModuleConfiguration;
    } else if (!config && name) {
      return this.getModuleConfiguration(name, ModuleManager.fullModuleConfiguration);
    } else if (config && !name) {
      return config;
    } else if (config && name) {
      if (config.module === name) {
        return config;
      } else if (config.children || config.viewPorts) {
        if (config.children) {
          const result = this.getModuleConfigurationFromChildren(name, config.children);
          if (result) {
            return result;
          }
        }
        if (config.viewPorts) {
          let matchingViewports = [];

          for (let viewportConfig of config.viewPorts) {
            if (viewportConfig.module === name) {
              matchingViewports.push(viewportConfig);
            }
          }

          if (matchingViewports.length > 0) {
            return config;
          }
        }

      }
    }
  }

  public  getModule(module: string): RegisteredModule {
    return ModuleManager.registeredModules.find((registeredModule: RegisteredModule) => {
      return registeredModule.name === module;
    });
  }

  public  getInstancedModule(moduleName: string, config ?: ModuleConfiguration): InstancedModule {
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

  public  getChildModules(moduleConfiguration: ModuleConfiguration): InstancedModule[] {
    let result: InstancedModule[] = [];
    if (moduleConfiguration && moduleConfiguration.children && moduleConfiguration.children.length > 0) {
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

    if (moduleConfiguration && moduleConfiguration.module !== ModuleManager.unknownRouteModule) {
      if (!result.find((im: InstancedModule) => {
          return im.module.name === ModuleManager.unknownRouteModule;
        })) {
        const unknownModule = this.getInstancedModule(ModuleManager.unknownRouteModule, {
          module: ModuleManager.unknownRouteModule,
          route: "404",
          nav: false
        });
        result.push(unknownModule);

      }
    }
    return result;
  }
}
