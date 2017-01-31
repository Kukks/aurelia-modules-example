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

define('main-app/resources/iterable-repeat-strategy',["require", "exports", "aurelia-templating-resources"], function (require, exports, aurelia_templating_resources_1) {
    "use strict";
    var IteratorStrategy = (function () {
        function IteratorStrategy() {
        }
        IteratorStrategy.prototype.instanceChanged = function (repeat, items) {
            var _this = this;
            var removePromise = repeat.viewSlot.removeAll(true);
            if (removePromise instanceof Promise) {
                removePromise.then(function () { return _this._standardProcessItems(repeat, items); });
                return;
            }
            this._standardProcessItems(repeat, items);
        };
        IteratorStrategy.prototype._standardProcessItems = function (repeat, items) {
            var index = 0;
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var _a = items_1[_i], key = _a[0], value = _a[1];
                var overrideContext = aurelia_templating_resources_1.createFullOverrideContext(repeat, value, index, undefined, key);
                var view = repeat.viewFactory.create();
                view.bind(overrideContext.bindingContext, overrideContext);
                repeat.viewSlot.add(view);
                ++index;
            }
        };
        IteratorStrategy.prototype.instanceMutated = function (repeat, items, changes) {
        };
        IteratorStrategy.prototype.getCollectionObserver = function (observerLocator, items) {
        };
        return IteratorStrategy;
    }());
    exports.IteratorStrategy = IteratorStrategy;
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
        config.globalResources('./resources/iterable-value-converter');
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

define('aurelia-templating-resources/compose',['exports', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-templating', 'aurelia-pal'], function (exports, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaTemplating, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Compose = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3;

  var Compose = exports.Compose = (_dec = (0, _aureliaTemplating.customElement)('compose'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaDependencyInjection.Container, _aureliaTemplating.CompositionEngine, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaTaskQueue.TaskQueue), _dec(_class = (0, _aureliaTemplating.noView)(_class = _dec2(_class = (_class2 = function () {
    function Compose(element, container, compositionEngine, viewSlot, viewResources, taskQueue) {
      

      _initDefineProp(this, 'model', _descriptor, this);

      _initDefineProp(this, 'view', _descriptor2, this);

      _initDefineProp(this, 'viewModel', _descriptor3, this);

      this.element = element;
      this.container = container;
      this.compositionEngine = compositionEngine;
      this.viewSlot = viewSlot;
      this.viewResources = viewResources;
      this.taskQueue = taskQueue;
      this.currentController = null;
      this.currentViewModel = null;
    }

    Compose.prototype.created = function created(owningView) {
      this.owningView = owningView;
    };

    Compose.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      processInstruction(this, createInstruction(this, {
        view: this.view,
        viewModel: this.viewModel,
        model: this.model
      }));
    };

    Compose.prototype.unbind = function unbind(bindingContext, overrideContext) {
      this.bindingContext = null;
      this.overrideContext = null;
      var returnToCache = true;
      var skipAnimation = true;
      this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Compose.prototype.modelChanged = function modelChanged(newValue, oldValue) {
      var _this = this;

      if (this.currentInstruction) {
        this.currentInstruction.model = newValue;
        return;
      }

      this.taskQueue.queueMicroTask(function () {
        if (_this.currentInstruction) {
          _this.currentInstruction.model = newValue;
          return;
        }

        var vm = _this.currentViewModel;

        if (vm && typeof vm.activate === 'function') {
          vm.activate(newValue);
        }
      });
    };

    Compose.prototype.viewChanged = function viewChanged(newValue, oldValue) {
      var _this2 = this;

      var instruction = createInstruction(this, {
        view: newValue,
        viewModel: this.currentViewModel || this.viewModel,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this2, _this2.currentInstruction);
      });
    };

    Compose.prototype.viewModelChanged = function viewModelChanged(newValue, oldValue) {
      var _this3 = this;

      var instruction = createInstruction(this, {
        viewModel: newValue,
        view: this.view,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this3, _this3.currentInstruction);
      });
    };

    return Compose;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'model', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'view', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'viewModel', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);


  function createInstruction(composer, instruction) {
    return Object.assign(instruction, {
      bindingContext: composer.bindingContext,
      overrideContext: composer.overrideContext,
      owningView: composer.owningView,
      container: composer.container,
      viewSlot: composer.viewSlot,
      viewResources: composer.viewResources,
      currentController: composer.currentController,
      host: composer.element
    });
  }

  function processInstruction(composer, instruction) {
    composer.currentInstruction = null;
    composer.compositionEngine.compose(instruction).then(function (controller) {
      composer.currentController = controller;
      composer.currentViewModel = controller ? controller.viewModel : null;
    });
  }
});
define('aurelia-templating-resources/if',['exports', 'aurelia-templating', 'aurelia-dependency-injection'], function (exports, _aureliaTemplating, _aureliaDependencyInjection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.If = undefined;

  

  var _dec, _dec2, _class;

  var If = exports.If = (_dec = (0, _aureliaTemplating.customAttribute)('if'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function If(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.showing = false;
      this.view = null;
      this.bindingContext = null;
      this.overrideContext = null;
    }

    If.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    If.prototype.valueChanged = function valueChanged(newValue) {
      var _this = this;

      if (this.__queuedChanges) {
        this.__queuedChanges.push(newValue);
        return;
      }

      var maybePromise = this._runValueChanged(newValue);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedChanges = _this.__queuedChanges = [];

          var runQueuedChanges = function runQueuedChanges() {
            if (!queuedChanges.length) {
              _this.__queuedChanges = undefined;
              return;
            }

            var nextPromise = _this._runValueChanged(queuedChanges.shift()) || Promise.resolve();
            nextPromise.then(runQueuedChanges);
          };

          maybePromise.then(runQueuedChanges);
        })();
      }
    };

    If.prototype._runValueChanged = function _runValueChanged(newValue) {
      var _this2 = this;

      if (!newValue) {
        var viewOrPromise = void 0;
        if (this.view !== null && this.showing) {
          viewOrPromise = this.viewSlot.remove(this.view);
          if (viewOrPromise instanceof Promise) {
            viewOrPromise.then(function () {
              return _this2.view.unbind();
            });
          } else {
            this.view.unbind();
          }
        }

        this.showing = false;
        return viewOrPromise;
      }

      if (this.view === null) {
        this.view = this.viewFactory.create();
      }

      if (!this.view.isBound) {
        this.view.bind(this.bindingContext, this.overrideContext);
      }

      if (!this.showing) {
        this.showing = true;
        return this.viewSlot.add(this.view);
      }

      return undefined;
    };

    If.prototype.unbind = function unbind() {
      if (this.view === null) {
        return;
      }

      this.view.unbind();

      if (!this.viewFactory.isCaching) {
        return;
      }

      if (this.showing) {
        this.showing = false;
        this.viewSlot.remove(this.view, true, true);
      }
      this.view.returnToCache();
      this.view = null;
    };

    return If;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/with',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-binding'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.With = undefined;

  

  var _dec, _dec2, _class;

  var With = exports.With = (_dec = (0, _aureliaTemplating.customAttribute)('with'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function With(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.parentOverrideContext = null;
      this.view = null;
    }

    With.prototype.bind = function bind(bindingContext, overrideContext) {
      this.parentOverrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    With.prototype.valueChanged = function valueChanged(newValue) {
      var overrideContext = (0, _aureliaBinding.createOverrideContext)(newValue, this.parentOverrideContext);
      if (!this.view) {
        this.view = this.viewFactory.create();
        this.view.bind(newValue, overrideContext);
        this.viewSlot.add(this.view);
      } else {
        this.view.bind(newValue, overrideContext);
      }
    };

    With.prototype.unbind = function unbind() {
      this.parentOverrideContext = null;

      if (this.view) {
        this.view.unbind();
      }
    };

    return With;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat',['exports', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-templating', './repeat-strategy-locator', './repeat-utilities', './analyze-view-factory', './abstract-repeater'], function (exports, _aureliaDependencyInjection, _aureliaBinding, _aureliaTemplating, _repeatStrategyLocator, _repeatUtilities, _analyzeViewFactory, _abstractRepeater) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Repeat = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var Repeat = exports.Repeat = (_dec = (0, _aureliaTemplating.customAttribute)('repeat'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.TargetInstruction, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaBinding.ObserverLocator, _repeatStrategyLocator.RepeatStrategyLocator), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = (_class2 = function (_AbstractRepeater) {
    _inherits(Repeat, _AbstractRepeater);

    function Repeat(viewFactory, instruction, viewSlot, viewResources, observerLocator, strategyLocator) {
      

      var _this = _possibleConstructorReturn(this, _AbstractRepeater.call(this, {
        local: 'item',
        viewsRequireLifecycle: (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory)
      }));

      _initDefineProp(_this, 'items', _descriptor, _this);

      _initDefineProp(_this, 'local', _descriptor2, _this);

      _initDefineProp(_this, 'key', _descriptor3, _this);

      _initDefineProp(_this, 'value', _descriptor4, _this);

      _this.viewFactory = viewFactory;
      _this.instruction = instruction;
      _this.viewSlot = viewSlot;
      _this.lookupFunctions = viewResources.lookupFunctions;
      _this.observerLocator = observerLocator;
      _this.key = 'key';
      _this.value = 'value';
      _this.strategyLocator = strategyLocator;
      _this.ignoreMutation = false;
      _this.sourceExpression = (0, _repeatUtilities.getItemsSourceExpression)(_this.instruction, 'repeat.for');
      _this.isOneTime = (0, _repeatUtilities.isOneTime)(_this.sourceExpression);
      _this.viewsRequireLifecycle = (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory);
      return _this;
    }

    Repeat.prototype.call = function call(context, changes) {
      this[context](this.items, changes);
    };

    Repeat.prototype.bind = function bind(bindingContext, overrideContext) {
      this.scope = { bindingContext: bindingContext, overrideContext: overrideContext };
      this.matcherBinding = this._captureAndRemoveMatcherBinding();
      this.itemsChanged();
    };

    Repeat.prototype.unbind = function unbind() {
      this.scope = null;
      this.items = null;
      this.matcherBinding = null;
      this.viewSlot.removeAll(true);
      this._unsubscribeCollection();
    };

    Repeat.prototype._unsubscribeCollection = function _unsubscribeCollection() {
      if (this.collectionObserver) {
        this.collectionObserver.unsubscribe(this.callContext, this);
        this.collectionObserver = null;
        this.callContext = null;
      }
    };

    Repeat.prototype.itemsChanged = function itemsChanged() {
      this._unsubscribeCollection();

      if (!this.scope) {
        return;
      }

      var items = this.items;
      this.strategy = this.strategyLocator.getStrategy(items);
      if (!this.strategy) {
        throw new Error('Value for \'' + this.sourceExpression + '\' is non-repeatable');
      }

      if (!this.isOneTime && !this._observeInnerCollection()) {
        this._observeCollection();
      }
      this.strategy.instanceChanged(this, items);
    };

    Repeat.prototype._getInnerCollection = function _getInnerCollection() {
      var expression = (0, _repeatUtilities.unwrapExpression)(this.sourceExpression);
      if (!expression) {
        return null;
      }
      return expression.evaluate(this.scope, null);
    };

    Repeat.prototype.handleCollectionMutated = function handleCollectionMutated(collection, changes) {
      if (!this.collectionObserver) {
        return;
      }
      this.strategy.instanceMutated(this, collection, changes);
    };

    Repeat.prototype.handleInnerCollectionMutated = function handleInnerCollectionMutated(collection, changes) {
      var _this2 = this;

      if (!this.collectionObserver) {
        return;
      }

      if (this.ignoreMutation) {
        return;
      }
      this.ignoreMutation = true;
      var newItems = this.sourceExpression.evaluate(this.scope, this.lookupFunctions);
      this.observerLocator.taskQueue.queueMicroTask(function () {
        return _this2.ignoreMutation = false;
      });

      if (newItems === this.items) {
        this.itemsChanged();
      } else {
        this.items = newItems;
      }
    };

    Repeat.prototype._observeInnerCollection = function _observeInnerCollection() {
      var items = this._getInnerCollection();
      var strategy = this.strategyLocator.getStrategy(items);
      if (!strategy) {
        return false;
      }
      this.collectionObserver = strategy.getCollectionObserver(this.observerLocator, items);
      if (!this.collectionObserver) {
        return false;
      }
      this.callContext = 'handleInnerCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
      return true;
    };

    Repeat.prototype._observeCollection = function _observeCollection() {
      var items = this.items;
      this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, items);
      if (this.collectionObserver) {
        this.callContext = 'handleCollectionMutated';
        this.collectionObserver.subscribe(this.callContext, this);
      }
    };

    Repeat.prototype._captureAndRemoveMatcherBinding = function _captureAndRemoveMatcherBinding() {
      if (this.viewFactory.viewFactory) {
        var instructions = this.viewFactory.viewFactory.instructions;
        var instructionIds = Object.keys(instructions);
        for (var i = 0; i < instructionIds.length; i++) {
          var expressions = instructions[instructionIds[i]].expressions;
          if (expressions) {
            for (var ii = 0; i < expressions.length; i++) {
              if (expressions[ii].targetProperty === 'matcher') {
                var matcherBinding = expressions[ii];
                expressions.splice(ii, 1);
                return matcherBinding;
              }
            }
          }
        }
      }

      return undefined;
    };

    Repeat.prototype.viewCount = function viewCount() {
      return this.viewSlot.children.length;
    };

    Repeat.prototype.views = function views() {
      return this.viewSlot.children;
    };

    Repeat.prototype.view = function view(index) {
      return this.viewSlot.children[index];
    };

    Repeat.prototype.matcher = function matcher() {
      return this.matcherBinding ? this.matcherBinding.sourceExpression.evaluate(this.scope, this.matcherBinding.lookupFunctions) : null;
    };

    Repeat.prototype.addView = function addView(bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.add(view);
    };

    Repeat.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.insert(index, view);
    };

    Repeat.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      this.viewSlot.move(sourceIndex, targetIndex);
    };

    Repeat.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      return this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Repeat.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
    };

    Repeat.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
    };

    Repeat.prototype.updateBindings = function updateBindings(view) {
      var j = view.bindings.length;
      while (j--) {
        (0, _repeatUtilities.updateOneTimeBinding)(view.bindings[j]);
      }
      j = view.controllers.length;
      while (j--) {
        var k = view.controllers[j].boundProperties.length;
        while (k--) {
          var binding = view.controllers[j].boundProperties[k].binding;
          (0, _repeatUtilities.updateOneTimeBinding)(binding);
        }
      }
    };

    return Repeat;
  }(_abstractRepeater.AbstractRepeater), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'items', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'local', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'key', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat-strategy-locator',['exports', './null-repeat-strategy', './array-repeat-strategy', './map-repeat-strategy', './set-repeat-strategy', './number-repeat-strategy'], function (exports, _nullRepeatStrategy, _arrayRepeatStrategy, _mapRepeatStrategy, _setRepeatStrategy, _numberRepeatStrategy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RepeatStrategyLocator = undefined;

  

  var RepeatStrategyLocator = exports.RepeatStrategyLocator = function () {
    function RepeatStrategyLocator() {
      

      this.matchers = [];
      this.strategies = [];

      this.addStrategy(function (items) {
        return items === null || items === undefined;
      }, new _nullRepeatStrategy.NullRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Array;
      }, new _arrayRepeatStrategy.ArrayRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Map;
      }, new _mapRepeatStrategy.MapRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Set;
      }, new _setRepeatStrategy.SetRepeatStrategy());
      this.addStrategy(function (items) {
        return typeof items === 'number';
      }, new _numberRepeatStrategy.NumberRepeatStrategy());
    }

    RepeatStrategyLocator.prototype.addStrategy = function addStrategy(matcher, strategy) {
      this.matchers.push(matcher);
      this.strategies.push(strategy);
    };

    RepeatStrategyLocator.prototype.getStrategy = function getStrategy(items) {
      var matchers = this.matchers;

      for (var i = 0, ii = matchers.length; i < ii; ++i) {
        if (matchers[i](items)) {
          return this.strategies[i];
        }
      }

      return null;
    };

    return RepeatStrategyLocator;
  }();
});
define('aurelia-templating-resources/null-repeat-strategy',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var NullRepeatStrategy = exports.NullRepeatStrategy = function () {
    function NullRepeatStrategy() {
      
    }

    NullRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      repeat.removeAllViews(true);
    };

    NullRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {};

    return NullRepeatStrategy;
  }();
});
define('aurelia-templating-resources/array-repeat-strategy',['exports', './repeat-utilities', 'aurelia-binding'], function (exports, _repeatUtilities, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ArrayRepeatStrategy = undefined;

  

  var ArrayRepeatStrategy = exports.ArrayRepeatStrategy = function () {
    function ArrayRepeatStrategy() {
      
    }

    ArrayRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getArrayObserver(items);
    };

    ArrayRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var itemsLength = items.length;

      if (!items || itemsLength === 0) {
        repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        return;
      }

      var children = repeat.views();
      var viewsLength = children.length;

      if (viewsLength === 0) {
        this._standardProcessInstanceChanged(repeat, items);
        return;
      }

      if (repeat.viewsRequireLifecycle) {
        (function () {
          var childrenSnapshot = children.slice(0);
          var itemNameInBindingContext = repeat.local;
          var matcher = repeat.matcher();

          var itemsPreviouslyInViews = [];
          var viewsToRemove = [];

          for (var index = 0; index < viewsLength; index++) {
            var view = childrenSnapshot[index];
            var oldItem = view.bindingContext[itemNameInBindingContext];

            if ((0, _repeatUtilities.indexOf)(items, oldItem, matcher) === -1) {
              viewsToRemove.push(view);
            } else {
              itemsPreviouslyInViews.push(oldItem);
            }
          }

          var updateViews = void 0;
          var removePromise = void 0;

          if (itemsPreviouslyInViews.length > 0) {
            removePromise = repeat.removeViews(viewsToRemove, true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              for (var _index = 0; _index < itemsLength; _index++) {
                var item = items[_index];
                var indexOfView = (0, _repeatUtilities.indexOf)(itemsPreviouslyInViews, item, matcher, _index);
                var _view = void 0;

                if (indexOfView === -1) {
                  var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_index], _index, itemsLength);
                  repeat.insertView(_index, overrideContext.bindingContext, overrideContext);

                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                } else if (indexOfView === _index) {
                  _view = children[indexOfView];
                  itemsPreviouslyInViews[indexOfView] = undefined;
                } else {
                  _view = children[indexOfView];
                  repeat.moveView(indexOfView, _index);
                  itemsPreviouslyInViews.splice(indexOfView, 1);
                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                }

                if (_view) {
                  (0, _repeatUtilities.updateOverrideContext)(_view.overrideContext, _index, itemsLength);
                }
              }

              _this._inPlaceProcessItems(repeat, items);
            };
          } else {
            removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              return _this._standardProcessInstanceChanged(repeat, items);
            };
          }

          if (removePromise instanceof Promise) {
            removePromise.then(updateViews);
          } else {
            updateViews();
          }
        })();
      } else {
        this._inPlaceProcessItems(repeat, items);
      }
    };

    ArrayRepeatStrategy.prototype._standardProcessInstanceChanged = function _standardProcessInstanceChanged(repeat, items) {
      for (var i = 0, ii = items.length; i < ii; i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[i], i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype._inPlaceProcessItems = function _inPlaceProcessItems(repeat, items) {
      var itemsLength = items.length;
      var viewsLength = repeat.viewCount();

      while (viewsLength > itemsLength) {
        viewsLength--;
        repeat.removeView(viewsLength, true, !repeat.viewsRequireLifecycle);
      }

      var local = repeat.local;

      for (var i = 0; i < viewsLength; i++) {
        var view = repeat.view(i);
        var last = i === itemsLength - 1;
        var middle = i !== 0 && !last;

        if (view.bindingContext[local] === items[i] && view.overrideContext.$middle === middle && view.overrideContext.$last === last) {
          continue;
        }

        view.bindingContext[local] = items[i];
        view.overrideContext.$middle = middle;
        view.overrideContext.$last = last;
        repeat.updateBindings(view);
      }

      for (var _i = viewsLength; _i < itemsLength; _i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_i], _i, itemsLength);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, array, splices) {
      var _this2 = this;

      if (repeat.__queuedSplices) {
        for (var i = 0, ii = splices.length; i < ii; ++i) {
          var _splices$i = splices[i],
              index = _splices$i.index,
              removed = _splices$i.removed,
              addedCount = _splices$i.addedCount;

          (0, _aureliaBinding.mergeSplice)(repeat.__queuedSplices, index, removed, addedCount);
        }

        repeat.__array = array.slice(0);
        return;
      }

      var maybePromise = this._runSplices(repeat, array.slice(0), splices);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedSplices = repeat.__queuedSplices = [];

          var runQueuedSplices = function runQueuedSplices() {
            if (!queuedSplices.length) {
              repeat.__queuedSplices = undefined;
              repeat.__array = undefined;
              return;
            }

            var nextPromise = _this2._runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
            queuedSplices = repeat.__queuedSplices = [];
            nextPromise.then(runQueuedSplices);
          };

          maybePromise.then(runQueuedSplices);
        })();
      }
    };

    ArrayRepeatStrategy.prototype._runSplices = function _runSplices(repeat, array, splices) {
      var _this3 = this;

      var removeDelta = 0;
      var rmPromises = [];

      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var removed = splice.removed;

        for (var j = 0, jj = removed.length; j < jj; ++j) {
          var viewOrPromise = repeat.removeView(splice.index + removeDelta + rmPromises.length, true);
          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }
        }
        removeDelta -= splice.addedCount;
      }

      if (rmPromises.length > 0) {
        return Promise.all(rmPromises).then(function () {
          var spliceIndexLow = _this3._handleAddedSplices(repeat, array, splices);
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);
        });
      }

      var spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);

      return undefined;
    };

    ArrayRepeatStrategy.prototype._handleAddedSplices = function _handleAddedSplices(repeat, array, splices) {
      var spliceIndex = void 0;
      var spliceIndexLow = void 0;
      var arrayLength = array.length;
      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var addIndex = spliceIndex = splice.index;
        var end = splice.index + splice.addedCount;

        if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
          spliceIndexLow = spliceIndex;
        }

        for (; addIndex < end; ++addIndex) {
          var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, array[addIndex], addIndex, arrayLength);
          repeat.insertView(addIndex, overrideContext.bindingContext, overrideContext);
        }
      }

      return spliceIndexLow;
    };

    return ArrayRepeatStrategy;
  }();
});
define('aurelia-templating-resources/repeat-utilities',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.updateOverrideContexts = updateOverrideContexts;
  exports.createFullOverrideContext = createFullOverrideContext;
  exports.updateOverrideContext = updateOverrideContext;
  exports.getItemsSourceExpression = getItemsSourceExpression;
  exports.unwrapExpression = unwrapExpression;
  exports.isOneTime = isOneTime;
  exports.updateOneTimeBinding = updateOneTimeBinding;
  exports.indexOf = indexOf;


  var oneTime = _aureliaBinding.bindingMode.oneTime;

  function updateOverrideContexts(views, startIndex) {
    var length = views.length;

    if (startIndex > 0) {
      startIndex = startIndex - 1;
    }

    for (; startIndex < length; ++startIndex) {
      updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
    }
  }

  function createFullOverrideContext(repeat, data, index, length, key) {
    var bindingContext = {};
    var overrideContext = (0, _aureliaBinding.createOverrideContext)(bindingContext, repeat.scope.overrideContext);

    if (typeof key !== 'undefined') {
      bindingContext[repeat.key] = key;
      bindingContext[repeat.value] = data;
    } else {
      bindingContext[repeat.local] = data;
    }
    updateOverrideContext(overrideContext, index, length);
    return overrideContext;
  }

  function updateOverrideContext(overrideContext, index, length) {
    var first = index === 0;
    var last = index === length - 1;
    var even = index % 2 === 0;

    overrideContext.$index = index;
    overrideContext.$first = first;
    overrideContext.$last = last;
    overrideContext.$middle = !(first || last);
    overrideContext.$odd = !even;
    overrideContext.$even = even;
  }

  function getItemsSourceExpression(instruction, attrName) {
    return instruction.behaviorInstructions.filter(function (bi) {
      return bi.originalAttrName === attrName;
    })[0].attributes.items.sourceExpression;
  }

  function unwrapExpression(expression) {
    var unwrapped = false;
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      expression = expression.expression;
    }
    while (expression instanceof _aureliaBinding.ValueConverter) {
      expression = expression.expression;
      unwrapped = true;
    }
    return unwrapped ? expression : null;
  }

  function isOneTime(expression) {
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      if (expression.name === 'oneTime') {
        return true;
      }
      expression = expression.expression;
    }
    return false;
  }

  function updateOneTimeBinding(binding) {
    if (binding.call && binding.mode === oneTime) {
      binding.call(_aureliaBinding.sourceContext);
    } else if (binding.updateOneTimeBindings) {
      binding.updateOneTimeBindings();
    }
  }

  function indexOf(array, item, matcher, startIndex) {
    if (!matcher) {
      return array.indexOf(item);
    }
    var length = array.length;
    for (var index = startIndex || 0; index < length; index++) {
      if (matcher(array[index], item)) {
        return index;
      }
    }
    return -1;
  }
});
define('aurelia-templating-resources/map-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MapRepeatStrategy = undefined;

  

  var MapRepeatStrategy = exports.MapRepeatStrategy = function () {
    function MapRepeatStrategy() {
      
    }

    MapRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getMapObserver(items);
    };

    MapRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    MapRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value, key) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size, key);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    MapRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, map, records) {
      var key = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        key = record.key;
        switch (record.type) {
          case 'update':
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), removeIndex, map.size, key);
            repeat.insertView(removeIndex, overrideContext.bindingContext, overrideContext);
            break;
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), map.size - 1, map.size, key);
            repeat.insertView(map.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            if (record.oldValue === undefined) {
              return;
            }
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    MapRepeatStrategy.prototype._getViewIndexByKey = function _getViewIndexByKey(repeat, key) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.key] === key) {
          return i;
        }
      }

      return undefined;
    };

    return MapRepeatStrategy;
  }();
});
define('aurelia-templating-resources/set-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SetRepeatStrategy = undefined;

  

  var SetRepeatStrategy = exports.SetRepeatStrategy = function () {
    function SetRepeatStrategy() {
      
    }

    SetRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getSetObserver(items);
    };

    SetRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    SetRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    SetRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, set, records) {
      var value = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        value = record.value;
        switch (record.type) {
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, set.size - 1, set.size);
            repeat.insertView(set.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            removeIndex = this._getViewIndexByValue(repeat, value);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    SetRepeatStrategy.prototype._getViewIndexByValue = function _getViewIndexByValue(repeat, value) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.local] === value) {
          return i;
        }
      }

      return undefined;
    };

    return SetRepeatStrategy;
  }();
});
define('aurelia-templating-resources/number-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NumberRepeatStrategy = undefined;

  

  var NumberRepeatStrategy = exports.NumberRepeatStrategy = function () {
    function NumberRepeatStrategy() {
      
    }

    NumberRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver() {
      return null;
    };

    NumberRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, value) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, value);
        });
        return;
      }
      this._standardProcessItems(repeat, value);
    };

    NumberRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, value) {
      var childrenLength = repeat.viewCount();
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var viewsToRemove = void 0;

      value = Math.floor(value);
      viewsToRemove = childrenLength - value;

      if (viewsToRemove > 0) {
        if (viewsToRemove > childrenLength) {
          viewsToRemove = childrenLength;
        }

        for (i = 0, ii = viewsToRemove; i < ii; ++i) {
          repeat.removeView(childrenLength - (i + 1), true, !repeat.viewsRequireLifecycle);
        }

        return;
      }

      for (i = childrenLength, ii = value; i < ii; ++i) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, i, i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }

      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
    };

    return NumberRepeatStrategy;
  }();
});
define('aurelia-templating-resources/analyze-view-factory',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.viewsRequireLifecycle = viewsRequireLifecycle;
  var lifecycleOptionalBehaviors = exports.lifecycleOptionalBehaviors = ['focus', 'if', 'repeat', 'show', 'with'];

  function behaviorRequiresLifecycle(instruction) {
    var t = instruction.type;
    var name = t.elementName !== null ? t.elementName : t.attributeName;
    return lifecycleOptionalBehaviors.indexOf(name) === -1 && (t.handlesAttached || t.handlesBind || t.handlesCreated || t.handlesDetached || t.handlesUnbind) || t.viewFactory && viewsRequireLifecycle(t.viewFactory) || instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function targetRequiresLifecycle(instruction) {
    var behaviors = instruction.behaviorInstructions;
    if (behaviors) {
      var i = behaviors.length;
      while (i--) {
        if (behaviorRequiresLifecycle(behaviors[i])) {
          return true;
        }
      }
    }

    return instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function viewsRequireLifecycle(viewFactory) {
    if ('_viewsRequireLifecycle' in viewFactory) {
      return viewFactory._viewsRequireLifecycle;
    }

    viewFactory._viewsRequireLifecycle = false;

    if (viewFactory.viewFactory) {
      viewFactory._viewsRequireLifecycle = viewsRequireLifecycle(viewFactory.viewFactory);
      return viewFactory._viewsRequireLifecycle;
    }

    if (viewFactory.template.querySelector('.au-animate')) {
      viewFactory._viewsRequireLifecycle = true;
      return true;
    }

    for (var id in viewFactory.instructions) {
      if (targetRequiresLifecycle(viewFactory.instructions[id])) {
        viewFactory._viewsRequireLifecycle = true;
        return true;
      }
    }

    viewFactory._viewsRequireLifecycle = false;
    return false;
  }
});
define('aurelia-templating-resources/abstract-repeater',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var AbstractRepeater = exports.AbstractRepeater = function () {
    function AbstractRepeater(options) {
      

      Object.assign(this, {
        local: 'items',
        viewsRequireLifecycle: true
      }, options);
    }

    AbstractRepeater.prototype.viewCount = function viewCount() {
      throw new Error('subclass must implement `viewCount`');
    };

    AbstractRepeater.prototype.views = function views() {
      throw new Error('subclass must implement `views`');
    };

    AbstractRepeater.prototype.view = function view(index) {
      throw new Error('subclass must implement `view`');
    };

    AbstractRepeater.prototype.matcher = function matcher() {
      throw new Error('subclass must implement `matcher`');
    };

    AbstractRepeater.prototype.addView = function addView(bindingContext, overrideContext) {
      throw new Error('subclass must implement `addView`');
    };

    AbstractRepeater.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      throw new Error('subclass must implement `insertView`');
    };

    AbstractRepeater.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      throw new Error('subclass must implement `moveView`');
    };

    AbstractRepeater.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeAllViews`');
    };

    AbstractRepeater.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.updateBindings = function updateBindings(view) {
      throw new Error('subclass must implement `updateBindings`');
    };

    return AbstractRepeater;
  }();
});
define('aurelia-templating-resources/show',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Show = undefined;

  

  var _dec, _dec2, _class;

  var Show = exports.Show = (_dec = (0, _aureliaTemplating.customAttribute)('show'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Show(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Show.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Show.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Show.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Show;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/aurelia-hide-style',['exports', 'aurelia-pal'], function (exports, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.aureliaHideClassName = undefined;
  exports.injectAureliaHideStyleAtHead = injectAureliaHideStyleAtHead;
  exports.injectAureliaHideStyleAtBoundary = injectAureliaHideStyleAtBoundary;
  var aureliaHideClassName = exports.aureliaHideClassName = 'aurelia-hide';

  var aureliaHideClass = '.' + aureliaHideClassName + ' { display:none !important; }';

  function injectAureliaHideStyleAtHead() {
    _aureliaPal.DOM.injectStyles(aureliaHideClass);
  }

  function injectAureliaHideStyleAtBoundary(domBoundary) {
    if (_aureliaPal.FEATURE.shadowDOM && domBoundary && !domBoundary.hasAureliaHideStyle) {
      domBoundary.hasAureliaHideStyle = true;
      _aureliaPal.DOM.injectStyles(aureliaHideClass, domBoundary);
    }
  }
});
define('aurelia-templating-resources/hide',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Hide = undefined;

  

  var _dec, _dec2, _class;

  var Hide = exports.Hide = (_dec = (0, _aureliaTemplating.customAttribute)('hide'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Hide(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Hide.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Hide.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Hide.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Hide;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/sanitize-html',['exports', 'aurelia-binding', 'aurelia-dependency-injection', './html-sanitizer'], function (exports, _aureliaBinding, _aureliaDependencyInjection, _htmlSanitizer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SanitizeHTMLValueConverter = undefined;

  

  var _dec, _dec2, _class;

  var SanitizeHTMLValueConverter = exports.SanitizeHTMLValueConverter = (_dec = (0, _aureliaBinding.valueConverter)('sanitizeHTML'), _dec2 = (0, _aureliaDependencyInjection.inject)(_htmlSanitizer.HTMLSanitizer), _dec(_class = _dec2(_class = function () {
    function SanitizeHTMLValueConverter(sanitizer) {
      

      this.sanitizer = sanitizer;
    }

    SanitizeHTMLValueConverter.prototype.toView = function toView(untrustedMarkup) {
      if (untrustedMarkup === null || untrustedMarkup === undefined) {
        return null;
      }

      return this.sanitizer.sanitize(untrustedMarkup);
    };

    return SanitizeHTMLValueConverter;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/html-sanitizer',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  var HTMLSanitizer = exports.HTMLSanitizer = function () {
    function HTMLSanitizer() {
      
    }

    HTMLSanitizer.prototype.sanitize = function sanitize(input) {
      return input.replace(SCRIPT_REGEX, '');
    };

    return HTMLSanitizer;
  }();
});
define('aurelia-templating-resources/replaceable',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Replaceable = undefined;

  

  var _dec, _dec2, _class;

  var Replaceable = exports.Replaceable = (_dec = (0, _aureliaTemplating.customAttribute)('replaceable'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function Replaceable(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.view = null;
    }

    Replaceable.prototype.bind = function bind(bindingContext, overrideContext) {
      if (this.view === null) {
        this.view = this.viewFactory.create();
        this.viewSlot.add(this.view);
      }

      this.view.bind(bindingContext, overrideContext);
    };

    Replaceable.prototype.unbind = function unbind() {
      this.view.unbind();
    };

    return Replaceable;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/focus',['exports', 'aurelia-templating', 'aurelia-binding', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaBinding, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Focus = undefined;

  

  var _dec, _dec2, _class;

  var Focus = exports.Focus = (_dec = (0, _aureliaTemplating.customAttribute)('focus', _aureliaBinding.bindingMode.twoWay), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTaskQueue.TaskQueue), _dec(_class = _dec2(_class = function () {
    function Focus(element, taskQueue) {
      var _this = this;

      

      this.element = element;
      this.taskQueue = taskQueue;
      this.isAttached = false;
      this.needsApply = false;

      this.focusListener = function (e) {
        _this.value = true;
      };
      this.blurListener = function (e) {
        if (_aureliaPal.DOM.activeElement !== _this.element) {
          _this.value = false;
        }
      };
    }

    Focus.prototype.valueChanged = function valueChanged(newValue) {
      if (this.isAttached) {
        this._apply();
      } else {
        this.needsApply = true;
      }
    };

    Focus.prototype._apply = function _apply() {
      var _this2 = this;

      if (this.value) {
        this.taskQueue.queueMicroTask(function () {
          if (_this2.value) {
            _this2.element.focus();
          }
        });
      } else {
        this.element.blur();
      }
    };

    Focus.prototype.attached = function attached() {
      this.isAttached = true;
      if (this.needsApply) {
        this.needsApply = false;
        this._apply();
      }
      this.element.addEventListener('focus', this.focusListener);
      this.element.addEventListener('blur', this.blurListener);
    };

    Focus.prototype.detached = function detached() {
      this.isAttached = false;
      this.element.removeEventListener('focus', this.focusListener);
      this.element.removeEventListener('blur', this.blurListener);
    };

    return Focus;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/css-resource',['exports', 'aurelia-templating', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-path', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaLoader, _aureliaDependencyInjection, _aureliaPath, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createCSSResource = _createCSSResource;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  var cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

  function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
      throw new Error('Failed loading required CSS file: ' + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
      var quote = p1.charAt(0);
      if (quote === '\'' || quote === '"') {
        p1 = p1.substr(1, p1.length - 2);
      }
      return 'url(\'' + (0, _aureliaPath.relativeToFile)(p1, address) + '\')';
    });
  }

  var CSSResource = function () {
    function CSSResource(address) {
      

      this.address = address;
      this._scoped = null;
      this._global = false;
      this._alreadyGloballyInjected = false;
    }

    CSSResource.prototype.initialize = function initialize(container, target) {
      this._scoped = new target(this);
    };

    CSSResource.prototype.register = function register(registry, name) {
      if (name === 'scoped') {
        registry.registerViewEngineHooks(this._scoped);
      } else {
        this._global = true;
      }
    };

    CSSResource.prototype.load = function load(container) {
      var _this = this;

      return container.get(_aureliaLoader.Loader).loadText(this.address).catch(function (err) {
        return null;
      }).then(function (text) {
        text = fixupCSSUrls(_this.address, text);
        _this._scoped.css = text;
        if (_this._global) {
          _this._alreadyGloballyInjected = true;
          _aureliaPal.DOM.injectStyles(text);
        }
      });
    };

    return CSSResource;
  }();

  var CSSViewEngineHooks = function () {
    function CSSViewEngineHooks(owner) {
      

      this.owner = owner;
      this.css = null;
    }

    CSSViewEngineHooks.prototype.beforeCompile = function beforeCompile(content, resources, instruction) {
      if (instruction.targetShadowDOM) {
        _aureliaPal.DOM.injectStyles(this.css, content, true);
      } else if (_aureliaPal.FEATURE.scopedCSS) {
        var styleNode = _aureliaPal.DOM.injectStyles(this.css, content, true);
        styleNode.setAttribute('scoped', 'scoped');
      } else if (!this.owner._alreadyGloballyInjected) {
        _aureliaPal.DOM.injectStyles(this.css);
        this.owner._alreadyGloballyInjected = true;
      }
    };

    return CSSViewEngineHooks;
  }();

  function _createCSSResource(address) {
    var _dec, _class;

    var ViewCSS = (_dec = (0, _aureliaTemplating.resource)(new CSSResource(address)), _dec(_class = function (_CSSViewEngineHooks) {
      _inherits(ViewCSS, _CSSViewEngineHooks);

      function ViewCSS() {
        

        return _possibleConstructorReturn(this, _CSSViewEngineHooks.apply(this, arguments));
      }

      return ViewCSS;
    }(CSSViewEngineHooks)) || _class);

    return ViewCSS;
  }
});
define('aurelia-templating-resources/attr-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AttrBindingBehavior = undefined;

  

  var AttrBindingBehavior = exports.AttrBindingBehavior = function () {
    function AttrBindingBehavior() {
      
    }

    AttrBindingBehavior.prototype.bind = function bind(binding, source) {
      binding.targetObserver = new _aureliaBinding.DataAttributeObserver(binding.target, binding.targetProperty);
    };

    AttrBindingBehavior.prototype.unbind = function unbind(binding, source) {};

    return AttrBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-mode-behaviors',['exports', 'aurelia-binding', 'aurelia-metadata'], function (exports, _aureliaBinding, _aureliaMetadata) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TwoWayBindingBehavior = exports.OneWayBindingBehavior = exports.OneTimeBindingBehavior = undefined;

  

  var _dec, _class, _dec2, _class2, _dec3, _class3;

  var modeBindingBehavior = {
    bind: function bind(binding, source, lookupFunctions) {
      binding.originalMode = binding.mode;
      binding.mode = this.mode;
    },
    unbind: function unbind(binding, source) {
      binding.mode = binding.originalMode;
      binding.originalMode = null;
    }
  };

  var OneTimeBindingBehavior = exports.OneTimeBindingBehavior = (_dec = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec(_class = function OneTimeBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneTime;
  }) || _class);
  var OneWayBindingBehavior = exports.OneWayBindingBehavior = (_dec2 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec2(_class2 = function OneWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneWay;
  }) || _class2);
  var TwoWayBindingBehavior = exports.TwoWayBindingBehavior = (_dec3 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec3(_class3 = function TwoWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.twoWay;
  }) || _class3);
});
define('aurelia-templating-resources/throttle-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ThrottleBindingBehavior = undefined;

  

  function throttle(newValue) {
    var _this = this;

    var state = this.throttleState;
    var elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
      state.last = +new Date();
      this.throttledMethod(newValue);
      return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
      state.timeoutId = setTimeout(function () {
        state.timeoutId = null;
        state.last = +new Date();
        _this.throttledMethod(state.newValue);
      }, state.delay - elapsed);
    }
  }

  var ThrottleBindingBehavior = exports.ThrottleBindingBehavior = function () {
    function ThrottleBindingBehavior() {
      
    }

    ThrottleBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToThrottle = 'updateTarget';
      if (binding.callSource) {
        methodToThrottle = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToThrottle = 'updateSource';
      }

      binding.throttledMethod = binding[methodToThrottle];
      binding.throttledMethod.originalName = methodToThrottle;

      binding[methodToThrottle] = throttle;

      binding.throttleState = {
        delay: delay,
        last: 0,
        timeoutId: null
      };
    };

    ThrottleBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.throttledMethod.originalName;
      binding[methodToRestore] = binding.throttledMethod;
      binding.throttledMethod = null;
      clearTimeout(binding.throttleState.timeoutId);
      binding.throttleState = null;
    };

    return ThrottleBindingBehavior;
  }();
});
define('aurelia-templating-resources/debounce-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DebounceBindingBehavior = undefined;

  

  function debounce(newValue) {
    var _this = this;

    var state = this.debounceState;
    if (state.immediate) {
      state.immediate = false;
      this.debouncedMethod(newValue);
      return;
    }
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(function () {
      return _this.debouncedMethod(newValue);
    }, state.delay);
  }

  var DebounceBindingBehavior = exports.DebounceBindingBehavior = function () {
    function DebounceBindingBehavior() {
      
    }

    DebounceBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToDebounce = 'updateTarget';
      if (binding.callSource) {
        methodToDebounce = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToDebounce = 'updateSource';
      }

      binding.debouncedMethod = binding[methodToDebounce];
      binding.debouncedMethod.originalName = methodToDebounce;

      binding[methodToDebounce] = debounce;

      binding.debounceState = {
        delay: delay,
        timeoutId: null,
        immediate: methodToDebounce === 'updateTarget' };
    };

    DebounceBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.debouncedMethod.originalName;
      binding[methodToRestore] = binding.debouncedMethod;
      binding.debouncedMethod = null;
      clearTimeout(binding.debounceState.timeoutId);
      binding.debounceState = null;
    };

    return DebounceBindingBehavior;
  }();
});
define('aurelia-templating-resources/signal-binding-behavior',['exports', './binding-signaler'], function (exports, _bindingSignaler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SignalBindingBehavior = undefined;

  

  var SignalBindingBehavior = exports.SignalBindingBehavior = function () {
    SignalBindingBehavior.inject = function inject() {
      return [_bindingSignaler.BindingSignaler];
    };

    function SignalBindingBehavior(bindingSignaler) {
      

      this.signals = bindingSignaler.signals;
    }

    SignalBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.updateTarget) {
        throw new Error('Only property bindings and string interpolation bindings can be signaled.  Trigger, delegate and call bindings cannot be signaled.');
      }
      if (arguments.length === 3) {
        var name = arguments[2];
        var bindings = this.signals[name] || (this.signals[name] = []);
        bindings.push(binding);
        binding.signalName = name;
      } else if (arguments.length > 3) {
        var names = Array.prototype.slice.call(arguments, 2);
        var i = names.length;
        while (i--) {
          var _name = names[i];
          var _bindings = this.signals[_name] || (this.signals[_name] = []);
          _bindings.push(binding);
        }
        binding.signalName = names;
      } else {
        throw new Error('Signal name is required.');
      }
    };

    SignalBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var name = binding.signalName;
      binding.signalName = null;
      if (Array.isArray(name)) {
        var names = name;
        var i = names.length;
        while (i--) {
          var n = names[i];
          var bindings = this.signals[n];
          bindings.splice(bindings.indexOf(binding), 1);
        }
      } else {
        var _bindings2 = this.signals[name];
        _bindings2.splice(_bindings2.indexOf(binding), 1);
      }
    };

    return SignalBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-signaler',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BindingSignaler = undefined;

  

  var BindingSignaler = exports.BindingSignaler = function () {
    function BindingSignaler() {
      

      this.signals = {};
    }

    BindingSignaler.prototype.signal = function signal(name) {
      var bindings = this.signals[name];
      if (!bindings) {
        return;
      }
      var i = bindings.length;
      while (i--) {
        bindings[i].call(_aureliaBinding.sourceContext);
      }
    };

    return BindingSignaler;
  }();
});
define('aurelia-templating-resources/update-trigger-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UpdateTriggerBindingBehavior = undefined;

  

  var _class, _temp;

  var eventNamesRequired = 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">';
  var notApplicableMessage = 'The updateTrigger binding behavior can only be applied to two-way bindings on input/select elements.';

  var UpdateTriggerBindingBehavior = exports.UpdateTriggerBindingBehavior = (_temp = _class = function () {
    function UpdateTriggerBindingBehavior(eventManager) {
      

      this.eventManager = eventManager;
    }

    UpdateTriggerBindingBehavior.prototype.bind = function bind(binding, source) {
      for (var _len = arguments.length, events = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        events[_key - 2] = arguments[_key];
      }

      if (events.length === 0) {
        throw new Error(eventNamesRequired);
      }
      if (binding.mode !== _aureliaBinding.bindingMode.twoWay) {
        throw new Error(notApplicableMessage);
      }

      var targetObserver = binding.observerLocator.getObserver(binding.target, binding.targetProperty);
      if (!targetObserver.handler) {
        throw new Error(notApplicableMessage);
      }
      binding.targetObserver = targetObserver;

      targetObserver.originalHandler = binding.targetObserver.handler;

      var handler = this.eventManager.createElementHandler(events);
      targetObserver.handler = handler;
    };

    UpdateTriggerBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.targetObserver.handler = binding.targetObserver.originalHandler;
      binding.targetObserver.originalHandler = null;
    };

    return UpdateTriggerBindingBehavior;
  }(), _class.inject = [_aureliaBinding.EventManager], _temp);
});
define('aurelia-templating-resources/html-resource-plugin',['exports', 'aurelia-templating', './dynamic-element'], function (exports, _aureliaTemplating, _dynamicElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getElementName = getElementName;
  exports.configure = configure;
  function getElementName(address) {
    return (/([^\/^\?]+)\.html/i.exec(address)[1].toLowerCase()
    );
  }

  function configure(config) {
    var viewEngine = config.container.get(_aureliaTemplating.ViewEngine);
    var loader = config.aurelia.loader;

    viewEngine.addResourcePlugin('.html', {
      'fetch': function fetch(address) {
        return loader.loadTemplate(address).then(function (registryEntry) {
          var _ref;

          var bindable = registryEntry.template.getAttribute('bindable');
          var elementName = getElementName(address);

          if (bindable) {
            bindable = bindable.split(',').map(function (x) {
              return x.trim();
            });
            registryEntry.template.removeAttribute('bindable');
          } else {
            bindable = [];
          }

          return _ref = {}, _ref[elementName] = (0, _dynamicElement._createDynamicElement)(elementName, address, bindable), _ref;
        });
      }
    });
  }
});
define('aurelia-templating-resources/dynamic-element',['exports', 'aurelia-templating'], function (exports, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createDynamicElement = _createDynamicElement;

  

  function _createDynamicElement(name, viewUrl, bindableNames) {
    var _dec, _dec2, _class;

    var DynamicElement = (_dec = (0, _aureliaTemplating.customElement)(name), _dec2 = (0, _aureliaTemplating.useView)(viewUrl), _dec(_class = _dec2(_class = function () {
      function DynamicElement() {
        
      }

      DynamicElement.prototype.bind = function bind(bindingContext) {
        this.$parent = bindingContext;
      };

      return DynamicElement;
    }()) || _class) || _class);

    for (var i = 0, ii = bindableNames.length; i < ii; ++i) {
      (0, _aureliaTemplating.bindable)(bindableNames[i])(DynamicElement);
    }
    return DynamicElement;
  }
});
define('main-app/resources/iterable-value-converter',["require", "exports"], function (require, exports) {
    "use strict";
    var IterableValueConverter = (function () {
        function IterableValueConverter() {
        }
        IterableValueConverter.prototype.toView = function (obj) {
            var temp = [];
            for (var prop in obj) {
                temp.push(prop);
            }
            return temp;
        };
        return IterableValueConverter;
    }());
    exports.IterableValueConverter = IterableValueConverter;
});

define('text!main-app/index.html', ['module'], function(module) { module.exports = "<template>\n  <p>\n    Hello, I'm the Main Application and these are my routes:\n  </p>\n  <ul>\n    <li repeat.for=\"route of router.navigation\">\n      <a href.bind=\"route.href\">${route.title}</a>\n    </li>\n  </ul>\n  <router-view></router-view>\n\n\n\n  Here are all the names of the registered routes  withing the name, no matter whether they are dynamic or static modules!:\n  <ul>\n    <li repeat.for=\"key of routeMapper.names | iterable\">\n      <a href.bind=\"routeMapper.generate(key)\">${key}</a></li>\n  </ul>\n</template>\n"; });
define('text!main-app/pages/home.html', ['module'], function(module) { module.exports = "<template>\n  Home for the main app\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map