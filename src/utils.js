export function getViewImageFromWidget(figureView) {
  if (figureView.is('element', 'img')) {
    return figureView;
  }

  const figureChildren = [];

  for (const figureChild of figureView.getChildren()) {
    figureChildren.push(figureChild);

    if (figureChild.is('element')) {
      figureChildren.push(...figureChild.getChildren());
    }
  }

  return figureChildren.find((viewChild) => viewChild.is('element', 'img'));
}
