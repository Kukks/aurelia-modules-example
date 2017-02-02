import {ModuleManager} from "./module.manager";
import {RouteMapper} from "aurelia-route-mapper";
import {RouteConfig, Router, RouterConfiguration} from "aurelia-router";
import {IAureliaModule, IModuleConfiguration, InstancedModule} from "./module.models";
import {autoinject} from "aurelia-dependency-injection";

@autoinject()
export abstract class BaseAureliaModule implements IAureliaModule {
  public router: Router;
  // protected moduleConfiguration: IModuleConfiguration;
  protected instancedModule: InstancedModule;

  constructor(public routeMapper: RouteMapper, private moduleManager: ModuleManager) {
  }

  public abstract getModuleName(): string;

  public getRoutes(): RouteConfig[] {
    const childModuleRoutes = this.childModuleRoutes;
    console.log(this.instancedModule.config.identifier || this.instancedModule.config.module, "the dynamic routes generated are: ", childModuleRoutes);
    return [...this.instancedModule ? this.instancedModule.module.routes : [], ...childModuleRoutes];
  };

  public get childModules(): InstancedModule[] {
    return this.moduleManager.getChildModules(this.instancedModule.config)
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
      this.routeMapper.map(routes)
    }
    this.router = router;
  }

  private setModuleConfiguration(routeConfig?: RouteConfig) {
    if (routeConfig && routeConfig.settings.instancedModule) {
      this.instancedModule = routeConfig.settings.instancedModule;
    } else {
      this.instancedModule = this.moduleManager.getInstancedModule(this.getModuleName())
    }
  }

  private  getChildModuleRoute(childModule: InstancedModule): RouteConfig[] {
    const childrenConfiguration: IModuleConfiguration[] = childModule.config.children;
    let childModuleRoutes: RouteConfig[] = [];
    childrenConfiguration.forEach((childConfig: IModuleConfiguration) => {

      const instancedModule = this.moduleManager.getInstancedModule(childConfig.module, childModule.config);
      childModuleRoutes.push(...this.getChildModuleRoute(instancedModule));
    });


    let route = childModule.config.route || childModule.config.module;
    if (!route.endsWith("/")) {
      route += "/";
    }

    let viewPorts = {};
    if (childModule.config.viewPorts && childModule.config.viewPorts) {
      viewPorts = {};
      for (let viewport of childModule.config.viewPorts) {
        const instancedModule = childModule.module.name === viewport.module ? childModule.module :
          this.moduleManager.getInstancedModule(viewport.module).module;
        viewPorts[viewport.name] = instancedModule.asPlugin ? instancedModule.name : `../${instancedModule.name}/index`;
      }
    } else {
      viewPorts["default"] = {moduleId: childModule.module.asPlugin ? childModule.module.name : `../${childModule.module.name}/index`};
    }

    const result: RouteConfig[] = [{
      name: childModule.config.identifier || childModule.config.module,
      title: childModule.config.title || childModule.config.module,
      route: route,
      nav: true,
      viewPorts: viewPorts,
      settings: {
        instancedModule: childModule,
        childRoutes: [...childModule.module.routes, ...childModuleRoutes]
      }
    }];
    return result;
  }

}
