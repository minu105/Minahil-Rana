// global.d.ts

declare module "react-draft-wysiwyg" {
  import * as React from "react";
  import { EditorState } from "draft-js";

  export interface EditorProps {
    editorState: EditorState;
    onEditorStateChange?: (editorState: EditorState) => void;
    toolbar?: any;
    wrapperClassName?: string;
    editorClassName?: string;
    toolbarClassName?: string;

    // ✅ add these missing props
    editorStyle?: React.CSSProperties;
    wrapperStyle?: React.CSSProperties;
  }

  export class Editor extends React.Component<EditorProps> {}
}

declare module "draftjs-to-html" {
  import { RawDraftContentState } from "draft-js";
  export default function draftToHtml(
    contentState: RawDraftContentState
  ): string;
}
