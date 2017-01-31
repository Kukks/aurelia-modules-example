define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('aurelia-modules/module.models',["require", "exports"], function (require, exports) {
    "use strict";
});

define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        var moduleConfiguration = {
            module: "main-app",
            identifier: "official-main-app",
            title: "App entry point",
            children: [
                {
                    module: "main-app",
                    identifier: "second-main-app-2",
                    title: "second App entry point in second",
                    children: [{
                            module: "main-app",
                            identifier: "third-main-app",
                            title: "third App entry point",
                            children: []
                        }]
                },
                {
                    module: "main-app",
                    identifier: "second-main-app",
                    title: "second App entry point",
                    route: "alternate-route-to-module",
                    children: [{
                            module: "main-app",
                            identifier: "third-main-app",
                            title: "third App entry point",
                            children: []
                        }]
                }
            ]
        };
        aurelia.use
            .standardConfiguration()
            .plugin('aurelia-repeat-strategies')
            .feature('main-app')
            .feature('aurelia-modules', moduleConfiguration);
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () {
            return aurelia.setRoot("main-app/index", document.body);
        });
    }
    exports.configure = configure;
});

define('aurelia-modules/module.manager',["require", "exports"], function (require, exports) {
    "use strict";
    var ModuleManager = (function () {
        function ModuleManager() {
        }
        ModuleManager.registerModule = function (name, routes, module, asPlugin) {
            if (asPlugin === void 0) { asPlugin = false; }
            this.registeredModules.push({ name: name, module: module, routes: routes, asPlugin: false });
        };
        ModuleManager.prototype.registerModule = function (name, routes, module, asPlugin) {
            if (asPlugin === void 0) { asPlugin = false; }
            ModuleManager.registerModule(name, routes, module, asPlugin);
        };
        ModuleManager.prototype.getModuleConfiguration = function (name, config) {
            if (!config) {
                return ModuleManager.fullModuleConfiguration;
            }
            if (name) {
                return config.children.find(function (moduleConfig) {
                    return moduleConfig.module === name;
                });
            }
            else {
                return config[0];
            }
        };
        ModuleManager.prototype.getModule = function (module) {
            return ModuleManager.registeredModules.find(function (registeredModule) {
                return registeredModule.name === module;
            });
        };
        ModuleManager.prototype.getInstancedModule = function (moduleName, config) {
            var registeredModule = this.getModule(moduleName);
            var moduleConfig = this.getModuleConfiguration(moduleName, config);
            if (registeredModule) {
                return {
                    module: registeredModule,
                    config: moduleConfig
                };
            }
            return null;
        };
        ModuleManager.prototype.getChildModules = function (moduleConfiguration) {
            var result = [];
            if (moduleConfiguration.children && moduleConfiguration.children.length > 0) {
                for (var _i = 0, _a = moduleConfiguration.children; _i < _a.length; _i++) {
                    var childModule = _a[_i];
                    var module_1 = this.getModule(childModule.module);
                    if (module_1) {
                        result.push({
                            module: module_1,
                            config: childModule
                        });
                    }
                }
            }
            return result;
        };
        return ModuleManager;
    }());
    ModuleManager.registeredModules = [];
    exports.ModuleManager = ModuleManager;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('aurelia-modules/base-aurelia-module',["require", "exports", "./module.manager", "aurelia-route-mapper", "aurelia-dependency-injection"], function (require, exports, module_manager_1, aurelia_route_mapper_1, aurelia_dependency_injection_1) {
    "use strict";
    function getChildModuleRoute(moduleManager, childModule) {
        var childrenConfiguration = childModule.config.children;
        var childModuleRoutes = [];
        childrenConfiguration.forEach(function (childConfig) {
            moduleManager.getChildModules(childConfig).forEach(function (childModuleOfChildConfig) {
                childModuleRoutes.push(getChildModuleRoute(moduleManager, childModuleOfChildConfig));
            });
        });
        return {
            name: childModule.config.identifier || childModule.config.module,
            title: childModule.config.title || childModule.config.module,
            route: childModule.config.route || childModule.config.module,
            nav: true,
            moduleId: childModule.module.asPlugin ? childModule.module.name : "../" + childModule.module.name + "/index",
            settings: {
                moduleConfig: childModule.config,
                childRoutes: childModule.module.routes.concat(childModuleRoutes)
            }
        };
    }
    var BaseAureliaModule = (function () {
        function BaseAureliaModule(routeMapper, moduleManager) {
            this.routeMapper = routeMapper;
            this.moduleManager = moduleManager;
        }
        BaseAureliaModule.prototype.getRoutes = function () {
            return this.childModuleRoutes.concat(this.instancedModule ? this.instancedModule.module.routes : []);
        };
        ;
        Object.defineProperty(BaseAureliaModule.prototype, "childModules", {
            get: function () {
                return this.moduleManager.getChildModules(this.instancedModule.config);
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(BaseAureliaModule.prototype, "childModuleRoutes", {
            get: function () {
                var _this = this;
                var result = [];
                this.childModules.forEach(function (childModule) {
                    var route = childModule.config.route || childModule.config.module;
                    result.push({
                        name: childModule.config.identifier || childModule.config.module,
                        title: childModule.config.title || childModule.config.module,
                        route: route,
                        nav: true,
                        moduleId: childModule.module.asPlugin ? childModule.module.name : "../" + childModule.module.name + "/index",
                        settings: {
                            instancedModule: childModule,
                            childRoutes: [getChildModuleRoute(_this.moduleManager, childModule)]
                        }
                    });
                });
                return result;
            },
            enumerable: true,
            configurable: true
        });
        BaseAureliaModule.prototype.configureRouter = function (routerConfiguration, router, params, routeConfig) {
            this.setModuleConfiguration(routeConfig);
            if (routerConfiguration) {
                var routes = this.getRoutes();
                routerConfiguration.map(routes);
                this.routeMapper.map(routes);
            }
            this.router = router;
        };
        BaseAureliaModule.prototype.setModuleConfiguration = function (routeConfig) {
            if (routeConfig && routeConfig.settings.instancedModule) {
                this.instancedModule = routeConfig.settings.instancedModule;
            }
            else {
                this.instancedModule = this.moduleManager.getInstancedModule(this.getModuleName());
            }
        };
        return BaseAureliaModule;
    }());
    BaseAureliaModule = __decorate([
        aurelia_dependency_injection_1.autoinject(),
        __metadata("design:paramtypes", [aurelia_route_mapper_1.RouteMapper, module_manager_1.ModuleManager])
    ], BaseAureliaModule);
    exports.BaseAureliaModule = BaseAureliaModule;
});

define('aurelia-modules/module.decorator',["require", "exports", "./module.manager"], function (require, exports, module_manager_1) {
    "use strict";
    function module(name, routes) {
        if (routes === void 0) { routes = []; }
        return function (target) {
            if (target) {
                module_manager_1.ModuleManager.registerModule(name, routes, target);
            }
            return target;
        };
    }
    exports.module = module;
});

define('aurelia-modules/index',["require", "exports", "./module.manager", "./base-aurelia-module", "./module.decorator", "./module.manager"], function (require, exports, module_manager_1, base_aurelia_module_1, module_decorator_1, module_manager_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(base_aurelia_module_1);
    __export(module_decorator_1);
    __export(module_manager_2);
    function configure(config, moduleConfiguration) {
        module_manager_1.ModuleManager.fullModuleConfiguration = moduleConfiguration;
    }
    exports.configure = configure;
});

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('main-app/index',["require", "exports", "aurelia-dependency-injection", "../aurelia-modules/index"], function (require, exports, aurelia_dependency_injection_1, index_1) {
    "use strict";
    var routes = [{
            name: "home",
            title: "home",
            route: "/",
            nav: true,
            moduleId: "./pages/home"
        }];
    var MainApplication = (function (_super) {
        __extends(MainApplication, _super);
        function MainApplication() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MainApplication.prototype.getModuleName = function () {
            return "main-app";
        };
        return MainApplication;
    }(index_1.BaseAureliaModule));
    MainApplication = __decorate([
        aurelia_dependency_injection_1.autoinject(),
        index_1.module("main-app", routes)
    ], MainApplication);
    exports.MainApplication = MainApplication;
    function configure(config) {
    }
    exports.configure = configure;
});

define('main-app/pages/home',["require", "exports"], function (require, exports) {
    "use strict";
    var Home = (function () {
        function Home() {
        }
        return Home;
    }());
    exports.Home = Home;
});

define('aurelia-route-mapper/route-mapper',['require','exports','module','aurelia-route-recognizer'],function (require, exports, module) {"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var aurelia_route_recognizer_1 = require("aurelia-route-recognizer");
var RouteMapper = (function (_super) {
    __extends(RouteMapper, _super);
    function RouteMapper() {
        _super.apply(this, arguments);
    }
    RouteMapper.prototype.map = function (routes, parentName, parentRoute) {
        var _this = this;
        if (parentName === void 0) { parentName = ''; }
        if (parentRoute === void 0) { parentRoute = ''; }
        routes.forEach(function (config) {
            var name = parentName ? parentName + "/" + config.name : config.name;
            var path = parentRoute + config.route;
            _this.add({
                path: path,
                handler: { name: name },
                caseSensitive: config.caseSensitive === true
            });
            if (config.settings && config.settings.childRoutes) {
                _this.map(config.settings.childRoutes, name, path);
            }
        });
    };
    return RouteMapper;
}(aurelia_route_recognizer_1.RouteRecognizer));
exports.RouteMapper = RouteMapper;

});

define('text!main-app/index.html', ['module'], function(module) { module.exports = "<template>\n  <p>\n    Hello, I'm the Main Application and these are my routes:\n  </p>\n  <ul>\n    <li repeat.for=\"route of router.navigation\">\n      <a href.bind=\"route.href\">${route.title}</a>\n    </li>\n  </ul>\n  <router-view></router-view>\n\n\n\n  Here are all the names of the registered routes  withing the name, no matter whether they are dynamic or static modules!:\n  <ul>\n    <li repeat.for=\"[key, value] of routeMapper.names | iterable\">\n      <a href.bind=\"routeMapper.generate(key)\">${key}</a></li>\n  </ul>\n</template>\n"; });
define('text!main-app/pages/home.html', ['module'], function(module) { module.exports = "<template>\n  Home for the main app\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map