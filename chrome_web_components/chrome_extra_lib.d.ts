/**************************************************************************
 * Extra Chrome specific features and new APIs which need to be mixed in.
 * 
 * The contents of this file is appending to lib.d.ts *before* processing.
 */
interface Element {
  remove(): void; // FF and Chrome specific.

  // Shadow DOM
  createShadowRoot(): ShadowRoot;
  
  webkitCreateShadowRoot(): ShadowRoot;
  
  getDestinationInsertionPoints(): NodeList;
  shadowRoot: ShadowRoot;
  webkitShadowRoot: ShadowRoot;
}

// Shadow DOM
interface ShadowRoot extends DocumentFragment {
  getElementById(elementId: string ): HTMLElement;
  getElementsByClassName(className: string): NodeList;
  getElementsByTagName(tagName: string): NodeList;
  getElementsByTagNameNS(namespace: string, localName: string): NodeList;
  getSelection(): Selection;
  elementFromPoint(x: number, y: number): Element;
  
  activeElement: Element;
  host: Element;
  olderShadowRoot: ShadowRoot;
  innerHTML: string;
  styleSheets: StyleSheetList;
}

// HTML Templates
interface HTMLTemplate extends HTMLElement {
  content: HTMLElement;
}

// HTML Template and custom element related.
interface HTMLContentElement extends HTMLElement {
  select: string;
  getDistributedNodes(): NodeList;
}

interface HTMLDialogElement extends HTMLElement {
  open: boolean;
  returnValue: string;
  show(anchor?: Element): void;
  show(anchor?: MouseEvent): void;
  showModal(anchor?: Element): void;
  showModal(anchor?: MouseEvent): void;
  close(returnValue?: string): void;
}

interface Document {
  createElement(tagName: "template"): HTMLTemplate;
  registerElement(tagName:string, props:any): any;
}


interface Window {
  CustomEvent: CustomEvent;
}

interface CustomEventOptions {
  type?: string;
  canBubble?: boolean;
  cancelable?: boolean;
  detail?: any;
}

interface KeyboardEvent {
  keyIdentifier: string;
}

interface Event {
  path: Node[]; // <- obsolete. Removed from later the Shadow DOM spec.
  deepPath: Node[];
  encapsulated: boolean;
}
