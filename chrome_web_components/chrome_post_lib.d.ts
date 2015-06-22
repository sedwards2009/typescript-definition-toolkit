/**************************************************************************
 * Extra Chrome specific features and new APIs.
 * 
 * The contents of this file are appending to chrome_lib.d.ts.
 */
declare var CustomEvent: {
  prototype: CustomEvent;
  new(type?: string, options?:CustomEventOptions): CustomEvent;
};
interface Console {
  timeStamp(label: string): void;
}
