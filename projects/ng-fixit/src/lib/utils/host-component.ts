import {
  getDebugNode,
  reflectComponentType,
  Type,
  ɵgetClosestComponentName as getClosestComponentName,
} from '@angular/core';

import { HostComponentInfo } from '../models/host-component';

export const discoverHostComponent = (element: Element): HostComponentInfo | undefined => {
  const name = getClosestComponentName(element) ?? undefined;
  if (!name) {
    return undefined;
  }

  const type = getDebugNode(element)?.componentInstance?.constructor as Type<unknown> | undefined;
  const selector = type ? (reflectComponentType(type)?.selector ?? undefined) : undefined;

  return {
    name,
    ...(selector ? { selector } : {}),
  };
};
