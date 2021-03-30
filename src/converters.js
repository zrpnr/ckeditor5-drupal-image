import { getViewImageFromWidget } from './utils';

/**
 * @todo: import from ckeditor5-image converters once imageInline is merged.
 * @see: https://github.com/ckeditor/ckeditor5/issues/8591
 */
export function modelToViewAttributeConverter( imageType, attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:${ imageType }`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const img = getViewImageFromWidget( element );

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', img );
	}
}
