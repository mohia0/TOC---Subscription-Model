# Figma Slides Adaptation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adapt the Table of Contents (TOC) Generator plugin to support Figma Slides by recognizing `SLIDE` nodes in addition to `FRAME` nodes.

**Architecture:** We will update the slide discovery logic in `code.js` to look for both `FRAME` and `SLIDE` node types. This ensures backward compatibility with standard Figma files while enabling support for Figma Slides.

**Tech Stack:** Figma Plugin API, JavaScript

---

## User Review Required

> [!WARNING]
> Please review this plan. This will modify the new copied directory `TOC - Slides Model` to support Figma Slides, leaving the original `TOC - Subscription Model` untouched.

## Open Questions

> [!IMPORTANT]
> 1. In Figma Slides, should the generated TOC be placed as a standard `FRAME` on the canvas, or should it be converted to a `SLIDE` node?
> 2. Do we want to exclusively support `SLIDE` nodes in this specific copy, or should it support both `FRAME` and `SLIDE` types universally? The current plan assumes supporting both for flexibility.

## Proposed Changes

### Core Logic

#### [MODIFY] [code.js](file:///m:/TOOLS%20BY%20ME/Figma%20Plugin/TOC%20V2/FIX%202026/TOC%20-%20Slides%20Model/code.js)

We need to update the node type checks across the file.

**Task 1: Update Slide Identification Logic**

**Files:**
- Modify: `code.js`

**Step 1: Update `scanFrames` to include SLIDE type**
Find line 564 and update it to accept both FRAME and SLIDE.

```javascript
  // Only include frames/slides whose name contains 'Z' (case-insensitive)
  if ((node.type === 'FRAME' || node.type === 'SLIDE') && /z/i.test(node.name)) {
```

**Step 2: Update `getFramesOnCurrentPage`**
Find line 665 and update it:

```javascript
    // Only collect frames/slides that are likely to be presentation slides
    if ((node.type === 'FRAME' || node.type === 'SLIDE') && node.name !== '__TOC_AUTO__') {
```

Find line 675 and update:
```javascript
      const isNotComponent = (node.type === 'FRAME' || node.type === 'SLIDE') && !node.name.startsWith('_');
```

Find line 691 and update:
```javascript
    // Only recurse into children if we're at the page level
    if ('children' in node && (node.type === 'PAGE' || node.type === 'FRAME' || node.type === 'SECTION')) {
```

**Step 3: Update `navigateToFrame` and UI event handlers**
Find line 876:
```javascript
  if (selection.length === 1 && (selection[0].type === 'FRAME' || selection[0].type === 'SLIDE')) {
```

Find line 2549:
```javascript
        frame = page.findOne && page.findOne(n => n.id === frameId && (n.type === 'FRAME' || n.type === 'SLIDE'));
```

Find line 2597:
```javascript
      if (change.type === 'PROPERTY_CHANGE' && change.propertyName === 'name' && (change.node.type === 'FRAME' || change.node.type === 'SLIDE')) {
```

## Verification Plan

### Manual Verification
- Run the plugin inside a standard Figma Design file to ensure `FRAME` slides are still detected and processed correctly.
- Run the plugin inside a Figma Slides file to ensure `SLIDE` nodes are detected and the TOC is generated successfully.
