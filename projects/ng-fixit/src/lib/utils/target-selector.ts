const CSS_PATH_SEPARATOR = ' > ';

export const targetSelectorFromCssPath = (cssPath: string): string => {
  const separatorIndex = cssPath.lastIndexOf(CSS_PATH_SEPARATOR);
  return separatorIndex === -1
    ? cssPath
    : cssPath.slice(separatorIndex + CSS_PATH_SEPARATOR.length);
};
