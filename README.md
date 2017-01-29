# aurelia-modules-example
A proof of concept for modular plug and play aurelia modules

* Easy module registration using `@module(name:string)` class decorator
* Re-usable modules, the same module can be loaded multiple times in a hierarchy or on a flat structure with alternative configuration(routes, titles, etc)
* Modules can be packaged separately and loaded as if they were aurelia plugins.
* Uses @heruan's `aurelia-route-mapper` 
