import {ModuleManager} from "./module.manager";
import {RouteMapper} from "aurelia-route-mapper";
import {RouteConfig, Router, RouterConfiguration} from "aurelia-router";
import {IAureliaModule, IModuleConfiguration, InstancedModule} from "./module.models";
import {autoinject} from "aurelia-dependency-injection";

@autoinject()
export abstract class BaseAureliaModule implements IAureliaModule {
  public router: Router;
  protected moduleConfiguration: IModuleConfiguration;

  constructor(public routeMapper: RouteMapper, private moduleManager: ModuleManager) {
  }

  public abstract getModuleName(): string;

  public getRoutes(): RouteConfig[] {
    return this.childModuleRoutes;
  };

  public get childModules(): InstancedModule[] {
    return this.moduleManager.getChildModules(this.moduleConfiguration)
  };

  public get childModuleRoutes(): RouteConfig[] {
    let result: RouteConfig[] = [];
    this.childModules.forEach((childModule: InstancedModule) => {
      result.push({
        name: childModule.config.identifier || childModule.config.module,
        title: childModule.config.title || childModule.config.module,
        route: childModule.config.route || childModule.config.module ,
        nav: true,
        moduleId: childModule.module.asPlugin? childModule.module.name : `../${childModule.module.name}/index`,
        settings: {
          moduleConfig: childModule.config
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
    if (routeConfig && routeConfig.settings.moduleConfig) {
      this.moduleConfiguration = routeConfig.settings.moduleConfig;
    }else{
      this.moduleConfiguration = this.moduleManager.getModuleConfiguration(this.getModuleName());
    }
  }


}
