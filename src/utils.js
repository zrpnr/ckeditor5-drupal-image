function findViewChild(viewElement, viewElementName, conversionApi) {
  const viewChildren = Array.from(
    conversionApi.writer.createRangeIn(viewElement).getItems(),
  );

  return viewChildren.find((item) => item.is('element', viewElementName));
}

function upcastAttribute(viewElementName, viewAttribute, modelAttribute) {
  return (dispatcher) =>
    dispatcher.on(
      `element:${viewElementName}`,
      (evt, data, conversionApi) => {
        const { viewItem, modelRange } = data;

        const modelElement = modelRange && modelRange.start.nodeAfter;

        if (!modelElement) {
          return;
        }

        conversionApi.writer.setAttribute(
          modelAttribute,
          viewItem.getAttribute(viewAttribute),
          modelElement,
        );
      },
    );
}

function downcastAttribute(
  viewElementName,
  viewAttribute,
  modelAttribute,
  modelElementName,
) {
  return (dispatcher) =>
    dispatcher.on(
      `insert:${modelElementName}`,
      (evt, data, conversionApi) => {
        const modelElement = data.item;

        const viewFigure = conversionApi.mapper.toViewElement(modelElement);
        const viewElement = findViewChild(
          viewFigure,
          viewElementName,
          conversionApi,
        );

        if (!viewElement) {
          return;
        }

        conversionApi.writer.setAttribute(
          viewAttribute,
          modelElement.getAttribute(modelAttribute),
          viewElement,
        );
      },
    );
}

function getImageAttributes() {
  return {
    dataUUID: 'data-entity-uuid',
    dataEntityType: 'data-entity-type',
  };
}

function convertFragmentToAttributes(editor, imageType) {
  const imageAttributes = getImageAttributes();
  editor.conversion.for('downcast').add(
    (dispatcher) => {
      // @todo remove this after https://github.com/ckeditor/ckeditor5/issues/5204
      //   has been resolved.
      dispatcher.on(`attribute:src:${imageType}`, (evt, data, conversionApi) => {
        const viewWriter = conversionApi.writer;

        const figure = conversionApi.mapper.toViewElement(data.item);
        const img = figure.getChild(0);

        let src = data.attributeNewValue;
        if (data.attributeNewValue !== null) {
          Object.entries(imageAttributes).forEach(([fragment, attribute]) => {
            const pattern = new RegExp(`\\#${fragment}\\=([^\\#\\?]+)`);
            const match = src.match(pattern);
            if (match) {
              src = src.replace(pattern, '');
              viewWriter.setAttribute(attribute, match[1], img);
            }
          });

          if (src !== data.attributeNewValue) {
            viewWriter.setAttribute('src', src, img);
          }
        }
      })
    }
  );
}

export function allowImageInlineDataAttributes(editor) {
  const modelElementName = 'imageInline';
  const imageAttributes = getImageAttributes();

  Object.entries(imageAttributes).forEach(([modelAttribute, viewAttribute]) => {
    editor.model.schema.extend(modelElementName, {
      allowAttributes: [modelAttribute],
    });

    editor.conversion.for('upcast').attributeToAttribute({
      view: viewAttribute,
      model: modelAttribute,
    });

    editor.conversion.for('dataDowncast').attributeToAttribute({
      view: viewAttribute,
      model: modelAttribute,
    });
  });

  convertFragmentToAttributes(editor, modelElementName);
}

export function allowImageDataAttributes(editor) {
  const modelElementName = 'image';

  const imageAttributes = getImageAttributes();

  Object.entries(imageAttributes).forEach(
    ([modelAttribute, viewAttribute]) => {
      console.log(`adding ${modelAttribute} : ${viewAttribute} for ${modelElementName}`);
      editor.model.schema.extend(modelElementName, {
        allowAttributes: [modelAttribute],
      });
      editor.conversion
        .for('upcast')
        .add(upcastAttribute('img', viewAttribute, modelAttribute));
      editor.conversion
        .for('downcast')
        .add(
          downcastAttribute(
            'img',
            viewAttribute,
            modelAttribute,
            modelElementName,
          ),
        )
    },
  );

  convertFragmentToAttributes(editor, modelElementName);
}