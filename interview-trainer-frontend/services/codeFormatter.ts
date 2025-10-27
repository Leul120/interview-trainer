"use client";

import Prism from "prismjs"
import "prismjs/components/prism-java"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/themes/prism.css"

export function formatCode(code: string, language = "javascript") {
  return Prism.highlight(code, Prism.languages[language], language)
}

