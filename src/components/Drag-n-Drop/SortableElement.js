import { sortableElement } from 'react-sortable-hoc';

export const SortableElement = sortableElement(({ children }) => {
  return children;
});
