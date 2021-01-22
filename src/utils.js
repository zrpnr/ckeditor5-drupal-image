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

export function allowDataAttributes(editor) {
  const viewElementName = 'img';
  const modelElementName = 'image';

  const imageAttributes = {
    dataUUID: 'data-entity-uuid',
    dataEntityType: 'data-entity-type',
  };

  Object.entries(imageAttributes).forEach(
    ([modelAttribute, viewAttribute]) => {
      editor.model.schema.extend(modelElementName, {
        allowAttributes: [modelAttribute],
      });
      editor.conversion
        .for('upcast')
        .add(upcastAttribute(viewElementName, viewAttribute, modelAttribute));
      editor.conversion
        .for('downcast')
        .add(
          downcastAttribute(
            viewElementName,
            viewAttribute,
            modelAttribute,
            modelElementName,
          ),
        );
    },
  );
}