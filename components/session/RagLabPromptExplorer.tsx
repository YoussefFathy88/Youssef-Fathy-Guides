import TabbedCodeExplorer from "@/components/shared/TabbedCodeExplorer";
import { RAG_LAB_BUILD_PROMPT_FILES } from "@/lib/rag-lab-prompts";

/**
 * Introduction-to-RAG lab: tabbed project tree + sequential copy-paste prompts
 * (same presentation shell as TabbedCodeExplorer).
 */
export default function RagLabPromptExplorer() {
  return (
    <TabbedCodeExplorer
      title="Project tree & build prompts"
      caption="One prompt per tab after the tree — paste in order: scaffold → index backend → index frontend → chat backend → chat frontend."
      defaultFile="tree"
      showFileTree
      files={RAG_LAB_BUILD_PROMPT_FILES}
    />
  );
}
