import {ModuleManager} from "./module.manager";
import {RouteMapper} from "aurelia-route-mapper";
import {RouteConfig, Router, RouterConfiguration, NavigationInstruction} from "aurelia-router";
import {IAureliaModule, IModuleConfiguration, InstancedModule, IRegisteredModule} from "./module.models";
import {autoinject} from "aurelia-dependency-injection";

@autoinject()
export abstract class BaseAureliaModule implements IAureliaModule {
  public router: Router;
  protected instancedModule: InstancedModule;

  constructor(public routeMapper: RouteMapper, private moduleManager: ModuleManager) {
  }

  public abstract getModuleName(): string;

  public getRoutes(): RouteConfig[] {
    const childModuleRoutes = this.childModuleRoutes;
    console.log(this.instancedModule.config.identifier ||
      this.instancedModule.config.module, "the dynamic routes generated are: ", childModuleRoutes);
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

  public activate(params: any, navigationInstruction: NavigationInstruction) {

    console.log("activating:", navigationInstruction, params);
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
      this.routeMapper.map(routes);
    }
    this.router = router;
  }

  private setModuleConfiguration(routeConfig?: RouteConfig) {
    if (routeConfig && routeConfig.settings.instancedModule) {
      this.instancedModule = routeConfig.settings.instancedModule;
    } else {
      this.instancedModule = this.moduleManager.getInstancedModule(this.getModuleName());
    }
  }

  private  getChildModuleRoute(childModule: InstancedModule): RouteConfig[] {
    const childrenConfiguration: IModuleConfiguration[] = childModule.config.children;
    let childModuleRoutes: RouteConfig[] = [];
    childrenConfiguration.forEach((childConfig: IModuleConfiguration) => {

      const instancedModule = this.moduleManager.getInstancedModule(childConfig.module, childModule.config);
      childModuleRoutes.push(...this.getChildModuleRoute(instancedModule));
    });

    const route = childModule.config.route || childModule.config.module;

    const result: RouteConfig[] = [{
      name: childModule.config.identifier || childModule.config.module,
      title: childModule.config.title || childModule.config.module,
      route: this.fixRoute(route),
      nav: true,
      href: childModule.config.href,
      viewPorts: this.createViewports(childModule),
      settings: {
        instancedModule: childModule,
        childRoutes: [...childModule.module.routes, ...childModuleRoutes]
      }
    }];
    return result;
  }

  private createViewports(childModule: InstancedModule): {} {
    let viewPorts = {};
    if (childModule.config.viewPorts && childModule.config.viewPorts) {
      viewPorts = {};
      for (let viewport of childModule.config.viewPorts) {
        let registeredModule: IRegisteredModule;
        let instancedModule: InstancedModule = childModule.module.name === viewport.module ? childModule :
          this.moduleManager.getInstancedModule(viewport.module);
        if (instancedModule) {
          registeredModule = instancedModule.module;
        }
        viewPorts[viewport.name] = {
          moduleId: registeredModule ?
            registeredModule.asPlugin ?
              registeredModule.name :
              `../${registeredModule.name}/index` :
            viewport.module
        };
      }
    } else {
      viewPorts["default"] = {
        moduleId: childModule.module.asPlugin ?
          childModule.module.name : `../${childModule.module.name}/index`
      };
    }
    return viewPorts;
  }

  private fixRoute(route: string | string[]): string | string[] {
    if (!Array.isArray(route)) {
      return this.fixTrailingSlash(route);
    } else {
      return Array.from(route, (singleRoute: string, i: number) => this.fixTrailingSlash(singleRoute));
    }
  }

  private fixTrailingSlash(str: string): string {
    if (str && !str.endsWith("/")) {
      str = `${str}/`;
    }
    return str;
  }

}
