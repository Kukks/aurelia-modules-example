import {
  IRegisteredModule,
  IAureliaModule,
  IModuleConfiguration,
  InstancedModule,
  AureliaModuleInitializer
} from "./module.models";

export class ModuleManager {
  private static registeredModules: IRegisteredModule[] = [];

  public static fullModuleConfiguration: IModuleConfiguration;

  public static registerModule(name: string, module: AureliaModuleInitializer): void {
    this.registeredModules.push({name, module, asPlugin: false});
  }

  public registerModule(name: string, module: (...args: any[]) => IAureliaModule): void {
    ModuleManager.registerModule(name, module);
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

