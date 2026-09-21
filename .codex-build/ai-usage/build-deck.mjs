import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "/Users/cenk/Desktop/Development/Borderless-Maastricht";
const skillDir = "/Users/cenk/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.22227/skills/presentations";
const tmpDir = path.join(workspaceDir, ".codex-build/ai-usage");
const finalPath = path.join(workspaceDir, "output/borderless-ai-usage-hackathon-v2.pptx");
const runtimePython = "/Users/cenk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href,
);
const font = resolvePresentationFont();
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = {
  ink: "#102A2A",
  green: "#114E4B",
  mint: "#DCEEE8",
  paper: "#F8F6F1",
  line: "#C9D4CF",
  blue: "#2E6BE6",
  white: "#FFFFFF",
  muted: "#5D6A67",
};

function box(slide, left, top, width, height, fill = "none", line = "none") {
  return slide.shapes.add({
    geometry: "rect",
    position: { left, top, width, height },
    fill: fill === "none" ? "none" : { type: "solid", color: fill },
    line: line === "none" ? { fill: "none", width: 0 } : { style: "solid", fill: line, width: 1 },
  });
}

function text(slide, value, left, top, width, height, options = {}) {
  const shape = box(slide, left, top, width, height);
  shape.text = value;
  shape.text.style = {
    typeface: font,
    fontSize: options.size ?? 22,
    bold: options.bold ?? false,
    color: options.color ?? C.ink,
    autoFit: "shrinkText",
    verticalAlignment: options.verticalAlignment ?? "middle",
    alignment: options.alignment ?? "left",
  };
  return shape;
}

function connector(slide, x1, y1, x2, y2, color = C.line, width = 2) {
  slide.shapes.add({
    geometry: "line",
    position: { left: x1, top: y1, width: x2 - x1, height: y2 - y1 },
    fill: "none",
    line: { fill: color, width },
  });
}

function number(slide, n, left, top, color = C.green) {
  box(slide, left, top, 34, 34, color);
  text(slide, n, left, top + 1, 34, 32, { size: 15, bold: true, color: C.white, alignment: "center" });
}

function footer(slide, page) {
  connector(slide, 56, 672, 1224, 672, C.line, 1);
  text(slide, "BORDERLESS  /  AI USAGE", 56, 682, 330, 20, { size: 11, bold: true, color: C.muted });
  text(slide, `0${page}`, 1180, 682, 44, 20, { size: 11, bold: true, color: C.muted, alignment: "right" });
}

// Slide 1 — personalized assistant
{
  const slide = deck.slides.add();
  slide.background.fill = C.paper;
  text(slide, "AI IN BORDERLESS", 56, 42, 300, 24, { size: 13, bold: true, color: C.green });
  text(slide, "A personal guide that can update the plan", 56, 84, 910, 62, { size: 40, bold: true, color: C.ink });
  text(slide, "The assistant receives the current situation, answers in context and proposes profile changes only with user confirmation.", 56, 160, 890, 52, { size: 20, color: C.muted });

  const stages = [
    ["User asks", "“I now work three days from home.”"],
    ["Relevant context", "Profile, open To-Dos and flagged impacts travel with the question."],
    ["Secure AI route", "The browser calls our backend. The OpenAI key stays on the server."],
    ["Guided answer", "A strict system prompt avoids invented figures and legal advice."],
    ["Confirmed update", "The AI can propose update_profile. The user approves before the dashboard changes."],
  ];
  const xs = [56, 286, 516, 746, 976];
  stages.forEach(([head, body], i) => {
    number(slide, String(i + 1), xs[i], 286, i === 4 ? C.blue : C.green);
    text(slide, head, xs[i], 334, 205, 34, { size: 18, bold: true });
    text(slide, body, xs[i], 374, 205, 106, { size: 15, color: C.muted, verticalAlignment: "top" });
    if (i < stages.length - 1) connector(slide, xs[i] + 167, 303, xs[i + 1] - 16, 303, C.line, 2);
  });
  box(slide, 56, 532, 1168, 94, C.mint);
  text(slide, "Safety by design", 82, 551, 220, 24, { size: 16, bold: true, color: C.green });
  text(slide, "No API key in the browser. No silent profile edits. The assistant acts as a guide, with the user in control.", 82, 579, 1062, 28, { size: 18, color: C.ink });
  slide.speakerNotes.textFrame.setText("Source: User-provided Borderless chatbot architecture.\nKey message: personal context improves relevance; confirmation keeps profile updates under user control.");
  footer(slide, 1);
}

// Slide 2 — retrieval grounded answers
{
  const slide = deck.slides.add();
  slide.background.fill = C.white;
  text(slide, "RETRIEVAL-AUGMENTED GENERATION", 56, 42, 450, 24, { size: 13, bold: true, color: C.green });
  text(slide, "Answers grounded in official sources", 56, 84, 870, 62, { size: 40, bold: true, color: C.ink });
  text(slide, "Before the model answers, Borderless retrieves relevant government guidance and passes it into the prompt as context.", 56, 160, 900, 52, { size: 20, color: C.muted });

  const stages = [
    ["Official documents", "Belastingdienst, SVB and GrenzInfoPunkt documents are stored as searchable vectors."],
    ["Profile-aware search", "A person working in Germany receives German-relevant material, not unrelated Belgian tax rules."],
    ["Context injection", "The most relevant legal passages enter the model prompt as ground truth."],
    ["Traceable answer", "The assistant answers from that context and the chat shows the exact source URLs."],
  ];
  const y = 270;
  const xs = [56, 348, 640, 932];
  stages.forEach(([head, body], i) => {
    box(slide, xs[i], y, 236, 226, i === 3 ? C.green : C.paper, i === 3 ? C.green : C.line);
    number(slide, String(i + 1), xs[i] + 22, y + 22, i === 3 ? C.blue : C.green);
    text(slide, head, xs[i] + 22, y + 70, 192, 42, { size: 19, bold: true, color: i === 3 ? C.white : C.ink, verticalAlignment: "top" });
    text(slide, body, xs[i] + 22, y + 122, 192, 78, { size: 15, color: i === 3 ? "#DCEEE8" : C.muted, verticalAlignment: "top" });
    if (i < stages.length - 1) connector(slide, xs[i] + 236, y + 113, xs[i + 1], y + 113, C.line, 2);
  });
  text(slide, "Why it matters", 56, 552, 180, 24, { size: 16, bold: true, color: C.green });
  text(slide, "The model does not rely on general legal knowledge alone. It works from current, official guidance that users can open and check.", 56, 583, 1070, 28, { size: 18, color: C.ink });
  slide.speakerNotes.textFrame.setText("Source: User-provided Borderless RAG architecture.\nKey message: retrieval narrows the answer to official, relevant guidance and exposes its sources.");
  footer(slide, 2);
}

await fs.mkdir(tmpDir, { recursive: true });
const candidatePath = path.join(tmpDir, "candidate.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);

await fs.mkdir(path.dirname(finalPath), { recursive: true });
await finalizePresentation({
  explicitTotalSlideCount: 2,
  requiredNativeTableOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [font] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(workspaceDir, ".codex-finalizer/borderless-ai-usage-v2.validation.json"),
});
