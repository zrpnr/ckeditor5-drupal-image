import { allowImageDataAttributes, allowImageInlineDataAttributes } from "./utils";

class DrupalImage {
  constructor(editor) {
    this.editor = editor;
  }

  afterInit() {
    const { editor } = this;
    const { schema } = editor.model;

    if (schema.isRegistered('imageInline')) {
      allowImageInlineDataAttributes(editor);
    }
    
    if (schema.isRegistered('image')) {
      allowImageDataAttributes(editor);
    }
  }
}

export default DrupalImage;
