import {ModuleManager} from "./module.manager";
import {RouteMapper} from "aurelia-route-mapper";
import {RouteConfig, Router, RouterConfiguration} from "aurelia-router";
import {AureliaModule, ModuleConfiguration, InstancedModule, RegisteredModule} from "./module.models";
import {autoinject} from "aurelia-dependency-injection";

@autoinject()
export abstract class BaseAureliaModule implements AureliaModule {
  public router: Router;
  public instancedModule: InstancedModule;
  private static routeMapperConfigured: boolean = false;

  constructor(public routeMapper: RouteMapper, protected moduleManager: ModuleManager) {
  }

  public abstract getModuleName(): string;

  public getRoutes(): RouteConfig[] {
    const childModuleRoutes = this.childModuleRoutes;
    return [...this.instancedModule ? this.instancedModule.module.routes : [], ...childModuleRoutes];
  };

  public get childModules(): InstancedModule[] {
    return this.moduleManager.getChildModules(this.instancedModule.config);
  };

  public get childModuleRoutes(): RouteConfig[] {
    let result: RouteConfig[] = [];
    this.childModules.forEach((childModule: InstancedModule) => {
      result.push(...this.getChildModuleRoute(childModule));
    });
    return result;
  }

  public configureRouter(routerConfiguration: RouterConfiguration,
                         router: Router,
                         params: Object,
                         routeConfig?: RouteConfig): void {
    routerConfiguration.options.pushState = true;
    this.setModuleConfiguration(routeConfig);
    if (routerConfiguration) {
      const routes = this.getRoutes();
      routerConfiguration.map(routes);
      if (!BaseAureliaModule.routeMapperConfigured) {
        this.routeMapper.map(routes);
      }

      console.log("routes for " + this.getModuleName(), routes);
      BaseAureliaModule.routeMapperConfigured = true;

      if (ModuleManager.unknownRouteModule && this.getModuleName() !== ModuleManager.unknownRouteModule) {
        const unknownRoute = routes.find((routeConfig: RouteConfig) => {
          return routeConfig.name === ModuleManager.unknownRouteModule;
        });

        if (this.instancedModule.module.path) {
          const folderCountDiff = (this.instancedModule.module.path.split("/").length - 1) - (unknownRoute.viewPorts.default.moduleId.split("/").length - 1);
          if (folderCountDiff > 0) {
            for (let i = 0; i < folderCountDiff; i++) {
              unknownRoute.viewPorts.default.moduleId = `../${unknownRoute.viewPorts.default.moduleId}`;
            }
          }
        }
        routerConfiguration.mapUnknownRoutes(unknownRoute);
      }
    }
    this.router = router;
  }

  private setModuleConfiguration(routeConfig?: RouteConfig) {
    if (routeConfig && routeConfig.settings.instancedModule &&
      this.getModuleName() === routeConfig.settings.instancedModule.config.module) {
      this.instancedModule = routeConfig.settings.instancedModule;
    } else {
      this.instancedModule = this.moduleManager.getInstancedModule(this.getModuleName());
    }
  }

  protected getChildModuleRoute(childModule: InstancedModule): RouteConfig[] {
    const childrenConfiguration: ModuleConfiguration[] = childModule.config.children || [];
    let childModuleRoutes: RouteConfig[] = [];
    childrenConfiguration.forEach((childConfig: ModuleConfiguration) => {

      const instancedModule = this.moduleManager.getInstancedModule(childConfig.module, childModule.config);
      childModuleRoutes.push(...this.getChildModuleRoute(instancedModule));
    });

    const route = childModule.config.route || childModule.config.module;
    let settings: {} = {
      instancedModule: childModule,
      childRoutes: [...childModule.module.routes, ...childModuleRoutes]
    };
    if (childModule.config.settings) {
      settings = Object.assign(settings, childModule.config.settings);
    }

    const result: RouteConfig[] = [{
      name: childModule.config.identifier || childModule.config.module,
      title: childModule.config.title || childModule.config.module,
      route: this.fixRoute(route),
      nav: childModule.config.nav === undefined ? true : childModule.config.nav,
      viewPorts: this.createViewports(childModule),
      settings
    }];

    if (childModule.config.href) {
      result[0].href = childModule.config.href;
    }
    return result;
  }

  private createViewports(childModule: InstancedModule): {} {
    let viewPorts = {};
    if (childModule.config.viewPorts && childModule.config.viewPorts) {
      viewPorts = {};
      for (let viewport of childModule.config.viewPorts) {
        if (viewport.name === "default") {
          viewPorts[viewport.name] = {
            moduleId: this.getModulePath(childModule.module)
          };
        } else {
          let registeredModule: RegisteredModule;
          let instancedModule: InstancedModule = childModule.module.name === viewport.module ? childModule :
            this.moduleManager.getInstancedModule(viewport.module);
          if (instancedModule) {
            registeredModule = instancedModule.module;
          }
          viewPorts[viewport.name] = {
            moduleId: this.getModulePath(registeredModule) || viewport.module
          };
        }
      }
    } else {
      viewPorts["default"] = {
        moduleId: this.getModulePath(childModule.module)
      };
    }
    return viewPorts;
  }

  private getModulePath(registeredModule: RegisteredModule): string {
    if (registeredModule) {
      return registeredModule.path || `../${registeredModule.name}/index`;
    }
    return null;
  }

  protected fixRoute(route: string | string[]): string | string[] {
    if (!Array.isArray(route)) {
      return this.fixTrailingSlash(route);
    } else {
      return Array.from(route, (singleRoute: string) => this.fixTrailingSlash(singleRoute));
    }
  }

  protected fixTrailingSlash(str: string): string {
    if (str && !str.endsWith("/")) {
      str = `${str}/`;
    }

    if (str && str.endsWith("//")) {
      str = str.substr(0, str.length - 1);
    }
    return str;
  }

}
