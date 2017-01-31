import {ModuleManager} from "./module.manager";
import {RouteMapper} from "aurelia-route-mapper";
import {RouteConfig, Router, RouterConfiguration} from "aurelia-router";
import {IAureliaModule, IModuleConfiguration, InstancedModule} from "./module.models";
import {autoinject} from "aurelia-dependency-injection";


function getChildModuleRoute(moduleManager: ModuleManager, childModule: InstancedModule):RouteConfig{
  const childrenConfiguration: IModuleConfiguration[] = childModule.config.children;
  let childModuleRoutes: RouteConfig[] = [];
  childrenConfiguration.forEach((childConfig: IModuleConfiguration)=>{
    moduleManager.getChildModules(childConfig).forEach((childModuleOfChildConfig: InstancedModule)=>{
      childModuleRoutes.push(getChildModuleRoute(moduleManager, childModuleOfChildConfig));
    });
  });

  return {
    name: childModule.config.identifier || childModule.config.module,
    title: childModule.config.title || childModule.config.module,
    route: childModule.config.route || childModule.config.module ,
    nav: true,
    moduleId: childModule.module.asPlugin? childModule.module.name : `../${childModule.module.name}/index`,
    settings: {
      moduleConfig: childModule.config,
      childRoutes: [...childModule.module.routes, ...childModuleRoutes ]
    }
  };
}

@autoinject()
export abstract class BaseAureliaModule implements IAureliaModule {
  public router: Router;
  // protected moduleConfiguration: IModuleConfiguration;
  protected instancedModule: InstancedModule;

  constructor(public routeMapper: RouteMapper, private moduleManager: ModuleManager) {
  }

  public abstract getModuleName(): string;

  public getRoutes(): RouteConfig[] {
    return [...this.childModuleRoutes, ...this.instancedModule?this.instancedModule.module.routes:[]];
  };

  public get childModules(): InstancedModule[] {
    return this.moduleManager.getChildModules(this.instancedModule.config)
  };

  public get childModuleRoutes(): RouteConfig[] {
    let result: RouteConfig[] = [];
    this.childModules.forEach((childModule: InstancedModule) => {
      const route = childModule.config.route || childModule.config.module;
      result.push({
        name: childModule.config.identifier || childModule.config.module,
        title: childModule.config.title || childModule.config.module,
        route: route,
        nav: true,
        moduleId: childModule.module.asPlugin? childModule.module.name : `../${childModule.module.name}/index`,
        settings: {
          instancedModule: childModule,
          childRoutes: [getChildModuleRoute(this.moduleManager, childModule)]
        }
      });
    });
    return result;
  }

  public configureRouter(routerConfiguration: RouterConfiguration,
                         router: Router,
                         params: Object,
                         routeConfig?: RouteConfig): void {
    this.setModuleConfiguration(routeConfig);
    if(routerConfiguration) {
      const routes = this.getRoutes();
      routerConfiguration.map(routes);
      this.routeMapper.map(routes)
    }
    this.router = router;
  }

  private setModuleConfiguration(routeConfig?:RouteConfig){
    if (routeConfig && routeConfig.settings.instancedModule) {
      this.instancedModule = routeConfig.settings.instancedModule;
    }else{
      this.instancedModule = this.moduleManager.getInstancedModule(this.getModuleName())
    }
  }


}
