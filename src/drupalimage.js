import { allowDataAttributes } from './utils';

class DrupalImage {
  constructor(editor) {
    this.editor = editor;
  }

  afterInit() {
    const { editor } = this;
    allowDataAttributes(editor);
  }
}

export default DrupalImage;