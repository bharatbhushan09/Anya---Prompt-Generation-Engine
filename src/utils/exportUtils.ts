import JSZip from 'jszip';
import { UploadedFileItem, ExportFormat, ModelType } from '../types';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSinglePrompt(item: UploadedFileItem, format: ExportFormat, selectedModel: ModelType = 'midjourney') {
  if (!item.result) return;

  const baseName = item.name.replace(/\.[^/.]+$/, '');

  if (format === 'json') {
    const dataStr = JSON.stringify(item.result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadBlob(blob, `${baseName}-prompt.json`);
  } else if (format === 'csv') {
    const headers = ['Filename', 'Model', 'Prompt', 'Negative Prompt', 'Style', 'Lighting', 'Camera', 'Confidence Score'];
    const promptValue = item.result.modelPrompts[selectedModel] || item.result.primaryPrompt;
    const row = [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${selectedModel}"`,
      `"${promptValue.replace(/"/g, '""')}"`,
      `"${item.result.negativePrompt.replace(/"/g, '""')}"`,
      `"${item.result.artStyle.replace(/"/g, '""')}"`,
      `"${item.result.lightingAndAtmosphere.replace(/"/g, '""')}"`,
      `"${item.result.cameraAndSettings.replace(/"/g, '""')}"`,
      `"${item.result.confidenceScore}%"`
    ];
    const csvContent = `${headers.join(',')}\n${row.join(',')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${baseName}-prompt.csv`);
  } else if (format === 'txt') {
    const txtContent = `=== PROMPTVISION EXTRACTED PROMPT ===
File: ${item.name}
Confidence Score: ${item.result.confidenceScore}%

[PRIMARY MASTER PROMPT]
${item.result.primaryPrompt}

[MODEL SPECIFIC PROMPTS]
• Midjourney v6:
  ${item.result.modelPrompts.midjourney}

• Stable Diffusion XL / A1111:
  ${item.result.modelPrompts.stableDiffusion}

• DALL-E 3:
  ${item.result.modelPrompts.dalle3}

• Flux.1:
  ${item.result.modelPrompts.flux}

[STYLISTIC DESCRIPTIONS]
• Subject & Action: ${item.result.subjectAndAction}
• Art Style & Medium: ${item.result.artStyle}
• Lighting & Atmosphere: ${item.result.lightingAndAtmosphere}
• Camera & Lens: ${item.result.cameraAndSettings}
• Composition: ${item.result.compositionAndFraming}

[NEGATIVE PROMPT]
${item.result.negativePrompt}

[SUGGESTED TAGS]
${item.result.suggestedTags.map(t => `#${t.tag}`).join(' ')}
`;
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, `${baseName}-prompt.txt`);
  }
}

export async function exportBatchPrompts(
  items: UploadedFileItem[],
  format: ExportFormat,
  selectedModel: ModelType = 'midjourney',
  zipFilename = 'promptvision-batch-export.zip'
) {
  const completedItems = items.filter(i => i.status === 'done' && i.result);
  if (completedItems.length === 0) return;

  if (format === 'json') {
    const batchData = completedItems.map(item => ({
      filename: item.name,
      result: item.result
    }));
    const blob = new Blob([JSON.stringify(batchData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `promptvision-batch-${Date.now()}.json`);
  } else if (format === 'csv') {
    const headers = ['Filename', 'Primary Prompt', 'Midjourney Prompt', 'Stable Diffusion Prompt', 'DALL-E 3 Prompt', 'Flux Prompt', 'Art Style', 'Lighting', 'Negative Prompt'];
    const rows = completedItems.map(item => {
      const r = item.result!;
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        `"${r.primaryPrompt.replace(/"/g, '""')}"`,
        `"${r.modelPrompts.midjourney.replace(/"/g, '""')}"`,
        `"${r.modelPrompts.stableDiffusion.replace(/"/g, '""')}"`,
        `"${r.modelPrompts.dalle3.replace(/"/g, '""')}"`,
        `"${r.modelPrompts.flux.replace(/"/g, '""')}"`,
        `"${r.artStyle.replace(/"/g, '""')}"`,
        `"${r.lightingAndAtmosphere.replace(/"/g, '""')}"`,
        `"${r.negativePrompt.replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `promptvision-batch-${Date.now()}.csv`);
  } else if (format === 'txt') {
    let txtContent = `========================================================\nPROMPTVISION BATCH PROMPT EXPORT (${completedItems.length} Images)\nGenerated: ${new Date().toLocaleString()}\n========================================================\n\n`;

    completedItems.forEach((item, index) => {
      const r = item.result!;
      txtContent += `--- [IMAGE ${index + 1}/${completedItems.length}] ${item.name} ---\n`;
      txtContent += `PROMPT (${selectedModel}):\n${r.modelPrompts[selectedModel] || r.primaryPrompt}\n\n`;
      txtContent += `STYLE: ${r.artStyle}\nLIGHTING: ${r.lightingAndAtmosphere}\nNEGATIVE PROMPT: ${r.negativePrompt}\n\n`;
      txtContent += `--------------------------------------------------------\n\n`;
    });

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, `promptvision-batch-${Date.now()}.txt`);
  } else if (format === 'zip') {
    const zip = new JSZip();
    const folder = zip.folder('prompts');

    completedItems.forEach((item) => {
      const r = item.result!;
      const cleanName = item.name.replace(/\.[^/.]+$/, '');
      const content = `Filename: ${item.name}

Primary Prompt:
${r.primaryPrompt}

Midjourney v6:
${r.modelPrompts.midjourney}

Stable Diffusion XL:
${r.modelPrompts.stableDiffusion}

DALL-E 3:
${r.modelPrompts.dalle3}

Flux.1:
${r.modelPrompts.flux}

Art Style: ${r.artStyle}
Lighting: ${r.lightingAndAtmosphere}
Camera: ${r.cameraAndSettings}
Negative Prompt: ${r.negativePrompt}
Suggested Tags: ${r.suggestedTags.map(t => t.tag).join(', ')}
`;
      folder?.file(`${cleanName}-prompt.txt`, content);
    });

    // Add batch JSON summary
    zip.file('batch-summary.json', JSON.stringify(completedItems.map(i => ({ filename: i.name, result: i.result })), null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, zipFilename);
  }
}
