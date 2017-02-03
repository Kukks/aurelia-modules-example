import {autoinject} from "aurelia-dependency-injection";
import {noView} from "aurelia-templating";

@noView
@autoinject
export class HiddenViewPort {
  constructor(private element: HTMLElement) {
  }

  activate() {
    // hide the router-view element
    (<HTMLElement>this.element.parentNode).classList.add('aurelia-hide');
  }

  deactivate() {
    // show the router-view element
    (<HTMLElement>this.element.parentNode).classList.remove('aurelia-hide');
  }
}
