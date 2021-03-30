import { modelToViewAttributeConverter } from './converters';

class DrupalImage {
  constructor(editor) {
    this.editor = editor;
  }

  afterInit() {
    const { editor } = this;
    const { schema } = editor.model;
    const fragmentAttributes = {
      dataUUID: 'data-entity-uuid',
      dataEntityType: 'data-entity-type',
    };

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

      drupalAttributes.forEach((drupalAttribute) => {
        editor.conversion
          .for('downcast')
          .add(modelToViewAttributeConverter(imageType, drupalAttribute));

        editor.conversion.for('upcast').attributeToAttribute({
          view: drupalAttribute,
          model: drupalAttribute,
        });
      });
    });

    editor.data.upcastDispatcher.on(
      `element:img`,
      (evt, data, conversionApi) => {
        const { consumable, writer } = conversionApi;

        if (!consumable.consume(data.viewItem, { src: /\#/ })) {
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
            console.log('its a match', match[1]);
            if (data.modelRange) {
              for (const item of data.modelRange.getItems({ shallow: true })) {
                if (schema.checkAttribute(item, attribute)) {
                  console.log('setting', match[1], item);
                  writer.setAttribute(attribute, match[1], item);
                  writer.setAttribute('src', src.replace(pattern, ''), item);
                }
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
