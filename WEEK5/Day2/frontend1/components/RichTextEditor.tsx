// RichTextEditor.tsx
"use client";

import dynamic from "next/dynamic";
import {
  EditorState,
  ContentState,
} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useState, useEffect } from "react";

// SSR disable karke editor import
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

function textToEditorState(text?: string) {
  if (!text) return EditorState.createEmpty();
  const content = ContentState.createFromText(text);
  return EditorState.createWithContent(content);
}

export default function RichTextEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange: (plain: string) => void;
}) {
  const [editorState, setEditorState] = useState(() => textToEditorState(value));

  // Only clear when parent explicitly sets empty string after submit
  useEffect(() => {
    if (value === "") {
      setEditorState(EditorState.createEmpty());
    }
  }, [value]);

  function handleChange(state: EditorState) {
    setEditorState(state);
    // Extract plain text (no HTML) so backend and UI do not get tags
    const plain = state.getCurrentContent().getPlainText();
    onChange(plain);
  }

  return (
    <div className="editor-container" dir="ltr">
      <Editor
        editorState={editorState}
        onEditorStateChange={handleChange}
        toolbar={{
          options: ["inline", "list", "textAlign"],
          inline: { options: ["bold", "italic", "underline"] },
          list: { options: ["unordered", "ordered"] },
          textAlign: { options: ["left", "center", "right"] },
        }}
        editorClassName="editor-content"
        wrapperClassName="editor-wrapper"
        toolbarClassName="editor-toolbar"
        editorStyle={{ direction: 'ltr', textAlign: 'left' }}
      />
      <style jsx global>{`
        .editor-container { font-family: inherit; direction: ltr; text-align: left; }
        .editor-wrapper { direction: ltr; }
        .editor-content { line-height: 1.6; }
        /* Ensure Draft.js internal elements are LTR and caret behaves normally */
        .editor-wrapper .rdw-editor-main,
        .editor-wrapper .DraftEditor-root,
        .editor-wrapper .public-DraftEditor-content {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: plaintext;
        }
        .rdw-editor-toolbar { margin-bottom: 0; border: none; }
      `}</style>
    </div>
  );
}

