import { getViewImageFromWidget, fragmentAttributes } from './utils';

/**
 * @todo: import from ckeditor5-image converters once imageInline is merged.
 * @see: https://github.com/ckeditor/ckeditor5/issues/8591
 */
export function modelToViewAttributeConverter(imageType, attributeKey) {
  return (dispatcher) => {
    dispatcher.on(`attribute:${attributeKey}:${imageType}`, converter);
  };

  function converter(evt, data, conversionApi) {
    if (!conversionApi.consumable.consume(data.item, evt.name)) {
      return;
    }

    const viewWriter = conversionApi.writer;
    const element = conversionApi.mapper.toViewElement(data.item);
    const img = getViewImageFromWidget(element);

    viewWriter.setAttribute(
      data.attributeKey,
      data.attributeNewValue || '',
      img,
    );
  }
}

// @todo remove this after https://github.com/ckeditor/ckeditor5/issues/5204
//   has been resolved.
export function convertSrcFragments(evt, data, conversionApi) {
  const { writer } = conversionApi;
  const element = conversionApi.mapper.toViewElement(data.item);
  const img =
    evt.name === 'attribute:src:image'
      ? getViewImageFromWidget(conversionApi.mapper.toViewElement(data.item))
      : getViewImageFromWidget(element);

  const src = data.attributeNewValue;
  console.log({ src }, src.match(/\#/));
  // Only process if there is a fragment.
  if (src && src.match(/\#/)) {
    Object.entries(fragmentAttributes).forEach(([fragment, attribute]) => {
      const pattern = new RegExp(`\\#${fragment}\\=([^\\#\\?]+)`);
      const match = src.match(pattern);
      if (match) {
        writer.setAttribute(attribute, match[1], img);
      }
    });

    // Remove fragments from src.
    writer.setAttribute('src', src.replace(/\#.*/, ''), img);
  }
}
