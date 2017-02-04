# aurelia-modules-example
A proof of concept for modular plug and play aurelia modules

* Easy module registration using `@module(name:string)` class decorator
* Re-usable modules, the same module can be loaded multiple times in a hierarchy or on a flat structure with alternative configuration(routes, titles, etc)
* Supports having the modules packages separately 
* Allows you to load your application sections in a different structure easily and through a simple configuration. 
* Uses @heruan's `aurelia-route-mapper`for easy link generation no matter which child router you are on

## Usage
* Create a module by extending a new class with the `BaseAureliaModule` class. This base class manages mapping the routes and child modules correctly.
* Decorate the new module with the `@module(name: string, routes: RouteConfig[] = [], path: string = null)`. If path is left null, the default path to the module is configured as `../${registeredModule.name}/index`
* Make sure the module index has found a way to get loaded. Th module decorator automatically registers it into the system.
* In your Aurelia configuration, call the aurelia modules feature `aurelia.feature('aurelia-modules', moduleConfiguration)`

