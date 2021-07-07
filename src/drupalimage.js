import {
  modelToViewAttributeConverter,
  convertSrcFragments,
} from './converters';
import { getViewImageFromWidget, fragmentAttributes } from './utils';

class DrupalImage {
  constructor(editor) {
    this.editor = editor;
  }

  afterInit() {
    const { editor } = this;
    const { schema } = editor.model;
    const { conversion } = editor;

    const drupalAttributes = [
      'data-entity-uuid',
      'data-entity-type',
      'data-caption',
    ];

    // Allowing data-caption on both image types to avoid potential data loss.
    ['image', 'imageInline'].forEach((imageType) => {
      if (schema.isRegistered(imageType)) {
        schema.extend(imageType, {
          allowAttributes: drupalAttributes,
        });
      }

      // Convert src with fragment to data attributes.
      conversion.for('downcast').add((dispatcher) => {
        dispatcher.on(`attribute:src:${imageType}`, convertSrcFragments);
      });
    });

    // Copy the attributes directly to the img on downcast.
    drupalAttributes.forEach((drupalAttribute) => {
      conversion
        .for('dataDowncast')
        .add(modelToViewAttributeConverter('image', drupalAttribute));
    });

    // Converts existing src with fragment to entity-uuid and entity-type.
    // This does nothing on a Drupal upload, but converts existing fragments.
    editor.data.upcastDispatcher.on(
      `element:img`,
      (evt, data, conversionApi) => {
        const { writer } = conversionApi;

        if (!data.modelRange) {
          return;
        }

        const src = data.viewItem.getAttribute('src');
        // Only process if there is a fragment.
        if (!src.match(/\#/)) {
          return;
        }

        Object.entries(fragmentAttributes).forEach(([fragment, attribute]) => {
          const pattern = new RegExp(`\\#${fragment}\\=([^\\#\\?]+)`);
          const match = src.match(pattern);
          if (match) {
            for (const item of data.modelRange.getItems({ shallow: true })) {
              if (schema.checkAttribute(item, attribute)) {
                console.log('setting', match[1], item);
                writer.setAttribute(attribute, match[1], item);
              }
            }
          }
        });

        if (data.modelRange) {
          for (const item of data.modelRange.getItems({ shallow: true })) {
            writer.setAttribute('src', src.replace(/\#.*/, ''), item);
          }
        }
      },
      { priority: 'low' },
    );
  }
}

export default DrupalImage;
