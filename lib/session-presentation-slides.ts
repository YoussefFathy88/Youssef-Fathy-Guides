import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";

import { resolveOutlineIndex } from "@/components/session/OutlineTopicsContext";

export type CollectedSessionSlide = {
  nodes: ReactNode;
  outlineIndex?: number;
};

export type PresentationSlideChunk = {
  nodes: ReactNode[];
  outlineIndex?: number;
};

type SlideElementProps = {
  topic?: string;
  index?: number;
  children?: ReactNode;
};

function flattenChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (child == null || child === false) {
      return;
    }

    if (typeof child === "string") {
      if (child.trim() !== "") {
        result.push(child);
      }
      return;
    }

    if (!isValidElement(child)) {
      return;
    }

    if (child.type === Fragment) {
      result.push(
        ...flattenChildren((child.props as { children?: ReactNode }).children),
      );
      return;
    }

    result.push(child);
  });

  return result;
}

function getComponentName(type: ReactElement["type"]): string | undefined {
  if (typeof type === "string") {
    return type;
  }

  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName ?? fn.name;
  }

  return undefined;
}

function getSlideElementProps(child: ReactNode): SlideElementProps | null {
  if (!isValidElement(child)) {
    return null;
  }

  const props = child.props as SlideElementProps;

  if (typeof props.topic === "string" && props.topic.trim().length > 0) {
    return props;
  }

  const name = getComponentName(child.type);
  if (name === "SessionSlide") {
    return props;
  }

  const marker = (child.props as { "data-session-slide-marker"?: string })[
    "data-session-slide-marker"
  ];
  if (marker === "slide") {
    return props;
  }

  return null;
}

export function isSessionOutlineGroupElement(child: ReactNode): child is ReactElement<{
  index?: number;
  children?: ReactNode;
}> {
  if (!isValidElement(child)) {
    return false;
  }

  const props = child.props as SlideElementProps & {
    "data-session-outline-group-marker"?: string;
  };

  if (props.topic !== undefined) {
    return false;
  }

  const name = getComponentName(child.type);
  if (name === "SessionOutlineGroup") {
    return true;
  }

  return props["data-session-outline-group-marker"] !== undefined;
}

export function getOutlineGroupIndex(child: ReactElement<{ index?: number }>): number | undefined {
  const props = child.props as {
    index?: number;
    "data-session-outline-group-marker"?: string;
  };

  if (typeof props.index === "number") {
    return props.index;
  }

  const marker = props["data-session-outline-group-marker"];
  if (marker !== undefined) {
    const parsed = Number.parseInt(marker, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

export function isH2SlideMarker(child: ReactNode): boolean {
  if (!isValidElement(child)) {
    return false;
  }

  if (child.type === "h2") {
    return true;
  }

  const marker = (child.props as { "data-session-slide-marker"?: string } | null)?.[
    "data-session-slide-marker"
  ];
  return marker === "h2";
}

/** Walk the MDX tree and collect one entry per SessionSlide (topic prop or component name). */
export function collectExplicitSlides(
  children: ReactNode,
  topics: string[],
  inheritedOutlineIndex?: number,
): CollectedSessionSlide[] {
  const slides: CollectedSessionSlide[] = [];

  const visit = (nodes: ReactNode, inherited?: number) => {
    for (const child of flattenChildren(nodes)) {
      const slideProps = getSlideElementProps(child);

      if (slideProps) {
        slides.push({
          nodes: slideProps.children,
          outlineIndex: resolveOutlineIndex(
            slideProps.topic,
            slideProps.index ?? inherited,
            topics,
          ),
        });
        continue;
      }

      if (isSessionOutlineGroupElement(child)) {
        visit(child.props.children, getOutlineGroupIndex(child) ?? inherited);
        continue;
      }

      if (isValidElement(child)) {
        visit((child.props as { children?: ReactNode }).children, inherited);
      }
    }
  };

  visit(children, inheritedOutlineIndex);
  return slides;
}

export function buildPresentationSlides(
  children: ReactNode,
  topics: string[],
  inheritedOutlineIndex?: number,
): PresentationSlideChunk[] {
  const explicit = collectExplicitSlides(children, topics, inheritedOutlineIndex);
  if (explicit.length > 0) {
    return explicit.map((slide) => ({
      nodes: Children.toArray(slide.nodes).filter(Boolean),
      outlineIndex: slide.outlineIndex,
    }));
  }

  const items = flattenChildren(children);
  const slides: PresentationSlideChunk[] = [];
  let current: ReactNode[] = [];
  let currentOutlineIndex = inheritedOutlineIndex;

  const flush = () => {
    if (current.length > 0) {
      slides.push({ nodes: current, outlineIndex: currentOutlineIndex });
      current = [];
    }
  };

  for (const child of items) {
    if (isSessionOutlineGroupElement(child)) {
      flush();
      slides.push(
        ...buildPresentationSlides(
          child.props.children,
          topics,
          getOutlineGroupIndex(child) ?? inheritedOutlineIndex,
        ),
      );
      continue;
    }

    if (isH2SlideMarker(child)) {
      flush();
      current = [child];
    } else {
      current.push(child);
    }
  }

  flush();

  return slides.length > 0 ? slides : [{ nodes: items, outlineIndex: inheritedOutlineIndex }];
}
