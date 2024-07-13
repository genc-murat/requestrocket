declare module 'jsoneditor' {
  export type JSONEditorMode = 'tree' | 'view' | 'form' | 'code' | 'text' | 'preview';
  export interface JSONEditorOptions {
    mode?: JSONEditorMode;
    modes?: JSONEditorMode[];
  }
  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions);
    set(json: object): void;
    get(): object;
    destroy(): void;
    update(json: object): void;
  }
}
