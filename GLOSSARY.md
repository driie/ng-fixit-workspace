# ng-fixit

A developer tool that turns visual UI selections and correction notes into paste-ready Markdown for AI coding agents.

## Language

**Annotation**:
One selected Target plus a required correction note from the developer, destined for an AI agent. A Target click alone is not an Annotation until the note is provided.
_Avoid_: comment, pin, mark, issue, feedback item

**Target**:
The single DOM element an Annotation refers to. Freeform regions and multi-element sets are out of scope for the core model.
_Avoid_: region, selection box, node set

**Report**:
The structured Markdown artifact containing one or more Annotations that a developer copies into an AI agent so it can locate and fix UI issues.
_Avoid_: payload, dump, export file, ticket

**Annotation Mode**:
The active state in which the developer can select Targets and create Annotations. Target clicks are captured and do not run the host UI.
_Avoid_: edit mode, inspect mode, debug mode, capture mode

**Locator**:
The structured description of a Target’s place in the UI (for example a CSS selector path and bounding box) used so an agent can find the same element again.
_Avoid_: fingerprint, address, path alone

**Host Component**:
The nearest Angular component that owns or wraps a Target, when that relationship can be discovered at runtime.
_Avoid_: component tree, ancestor chain, injector parent
