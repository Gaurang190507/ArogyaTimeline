import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  AlertCircle,
  Calendar,
  Activity,
  TrendingUp,
} from 'lucide-react';

/**
 * Tokenize and render inline formatting:
 * - Bold (**text**) -> High-contrast styled pills, vital measurement badges, or date chips
 * - Italic (*text*) -> Muted italic text
 * - Code (`code`) -> Styled code tag
 * - Plain text
 */
const parseInline = (text, isUser = false) => {
  if (!text) return null;

  // Split by markdown inline tokens: **bold**, *italic*, `code`
  const regex = /(\*\*[\s\S]+?\*\*|\*[^\*\n]+?\*|`[^`\n]+?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold match: **content**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2).trim();

      // Check if it's a vital reading / measurement (e.g. 130/85 mmHg, 95 mg/dL, 72 kg, 98.6 °F)
      const isVital =
        /(\d+(\/\d+)?\s*(mmHg|mg\/dL|mmol\/L|bpm|kg|lbs|°F|°C|%|g|ml))/i.test(inner) ||
        /^\d{2,3}\/\d{2,3}$/.test(inner);

      // Check if it's a date (e.g. 2026-09-01)
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(inner);

      // Check if it's a numeric count (e.g. "1 blood pressure readings")
      const isCount = /^\d+\s+[a-zA-Z\u0900-\u0D7F\s]+$/.test(inner) && inner.length < 35;

      if (isUser) {
        return (
          <strong
            key={index}
            className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700"
          >
            {inner}
          </strong>
        );
      }

      // Vital Measurement Badge
      if (isVital) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 font-extrabold text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-lg text-xs sm:text-sm shadow-2xs mx-1 align-baseline"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{inner}</span>
          </span>
        );
      }

      // Date Tag
      if (isDate) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-200/90 dark:border-slate-600 px-1.5 py-0.5 rounded-md text-xs mx-1 align-baseline"
          >
            <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>{inner}</span>
          </span>
        );
      }

      // Metric count pill
      if (isCount) {
        return (
          <span
            key={index}
            className="inline-flex items-center font-bold text-health-900 dark:text-health-200 bg-health-50 dark:bg-health-950/70 border border-health-200/90 dark:border-health-800 px-2 py-0.5 rounded-md text-xs sm:text-sm mx-1 shadow-2xs"
          >
            {inner}
          </span>
        );
      }

      // Standard Bold Highlight
      return (
        <strong
          key={index}
          className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100/90 dark:bg-slate-700/80 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-600 mx-0.5"
        >
          {inner}
        </strong>
      );
    }

    // Italic match: *content*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em
          key={index}
          className={`italic ${isUser ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}
        >
          {inner}
        </em>
      );
    }

    // Code match: `content`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
            isUser
              ? 'bg-slate-800 text-slate-200 border-slate-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          {inner}
        </code>
      );
    }

    // Plain text
    return <span key={index}>{part}</span>;
  });
};

/**
 * Break markdown content into semantic blocks:
 * - Headers (###, ##, #)
 * - Callouts (✅, ⚠️, 💡, ❌, ℹ️)
 * - Stats (📊, 📈)
 * - Lists (•, -, *, 1., 2.)
 * - Paragraphs
 */
const parseBlocks = (content) => {
  if (!content) return [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // 1. Headers: ### or ## or #
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2],
      });
      continue;
    }

    // 2. Callout cards
    if (line.startsWith('✅')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'callout',
        variant: 'success',
        text: line.replace(/^✅\s*/, ''),
      });
      continue;
    }

    if (line.startsWith('⚠️')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'callout',
        variant: 'warning',
        text: line.replace(/^⚠️\s*/, ''),
      });
      continue;
    }

    if (line.startsWith('💡')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'callout',
        variant: 'tip',
        text: line.replace(/^💡\s*/, ''),
      });
      continue;
    }

    if (line.startsWith('❌')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'callout',
        variant: 'danger',
        text: line.replace(/^❌\s*/, ''),
      });
      continue;
    }

    if (line.startsWith('ℹ️') || line.startsWith('📌')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'callout',
        variant: 'info',
        text: line.replace(/^(ℹ️|📌)\s*/, ''),
      });
      continue;
    }

    // 3. Stat / Metric highlight rows: 📊 or 📈
    if (line.startsWith('📊') || line.startsWith('📈')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({
        type: 'stat',
        icon: line.startsWith('📊') ? 'bar' : 'trend',
        text: line.replace(/^(📊|📈)\s*/, ''),
      });
      continue;
    }

    // 4. Bullet lists: •, -, *
    const bulletMatch = line.match(/^([•\-\*])\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet-list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'bullet-list', items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      continue;
    }

    // 5. Numbered lists: 1. , 2.
    const numberMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'number-list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'number-list', items: [] };
      }
      currentList.items.push({ num: numberMatch[1], text: numberMatch[2] });
      continue;
    }

    // 6. Regular paragraph line
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({
      type: 'paragraph',
      text: line,
    });
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
};

/**
 * Main Formatted AI Response component
 */
export const FormattedAIResponse = ({
  content = '',
  isUser = false,
  className = '',
}) => {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        // Section Headers
        if (block.type === 'header') {
          return (
            <div
              key={idx}
              className="flex items-center gap-2 pt-2.5 pb-1 border-b border-slate-100/80 dark:border-slate-700/80 mb-2"
            >
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-health-500 to-teal-600 shrink-0" />
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {parseInline(block.text, isUser)}
              </h4>
            </div>
          );
        }

        // Callout Status Banners
        if (block.type === 'callout') {
          if (block.variant === 'success') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 shadow-2xs my-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                  {parseInline(block.text, isUser)}
                </div>
              </div>
            );
          }

          if (block.variant === 'warning') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 shadow-2xs my-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                  {parseInline(block.text, isUser)}
                </div>
              </div>
            );
          }

          if (block.variant === 'tip') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/90 dark:border-sky-800/80 text-sky-900 dark:text-sky-200 shadow-2xs my-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                  {parseInline(block.text, isUser)}
                </div>
              </div>
            );
          }

          if (block.variant === 'danger') {
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 shadow-2xs my-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                  {parseInline(block.text, isUser)}
                </div>
              </div>
            );
          }

          // Info
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/90 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 shadow-2xs my-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                {parseInline(block.text, isUser)}
              </div>
            </div>
          );
        }

        // Stat / Metric Row
        if (block.type === 'stat') {
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-health-50/90 dark:from-slate-850 dark:from-slate-800/80 via-teal-50/40 dark:via-slate-800/60 to-slate-50 dark:to-slate-850 border border-health-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-2xs my-2"
            >
              <div className="w-8 h-8 rounded-xl bg-health-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                {block.icon === 'bar' ? (
                  <Activity className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                {parseInline(block.text, isUser)}
              </div>
            </div>
          );
        }

        // Bullet Lists
        if (block.type === 'bullet-list') {
          return (
            <ul key={idx} className="space-y-2 my-2.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-health-600 dark:bg-health-400 shrink-0 mt-2" />
                  <div className="flex-1">{parseInline(item, isUser)}</div>
                </li>
              ))}
            </ul>
          );
        }

        // Numbered Lists
        if (block.type === 'number-list') {
          return (
            <ol key={idx} className="space-y-2 my-2.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-health-100 dark:bg-slate-750 dark:bg-slate-700 text-health-800 dark:text-health-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-health-200 dark:border-slate-600">
                    {item.num}
                  </span>
                  <div className="flex-1">{parseInline(item.text, isUser)}</div>
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p
            key={idx}
            className={`text-xs sm:text-sm leading-relaxed ${
              isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200 font-normal'
            } my-1.5`}
          >
            {parseInline(block.text, isUser)}
          </p>
        );
      })}
    </div>
  );
};
