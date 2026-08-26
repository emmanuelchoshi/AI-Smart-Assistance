import PptxGenJS from 'pptxgenjs';
import { SlideDeckResult, SlideItem, SlideTheme } from '../types';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBg: string;
  textDark: string;
  textLight: string;
  accent: string;
}

const THEME_MAP: Record<SlideTheme, ThemeColors> = {
  indigo: {
    primary: '4F46E5', // Indigo 600
    secondary: '818CF8', // Indigo 400
    background: 'F8FAFC', // Slate 50
    cardBg: 'FFFFFF',
    textDark: '0F172A', // Slate 900
    textLight: '64748B', // Slate 500
    accent: '10B981', // Emerald 500
  },
  slate: {
    primary: '1E293B', // Slate 800
    secondary: '475569', // Slate 600
    background: 'F1F5F9', // Slate 100
    cardBg: 'FFFFFF',
    textDark: '0F172A',
    textLight: '64748B',
    accent: '3B82F6', // Blue 500
  },
  emerald: {
    primary: '065F46', // Emerald 800
    secondary: '10B981', // Emerald 500
    background: 'F0FDF4', // Emerald 50
    cardBg: 'FFFFFF',
    textDark: '064E3B',
    textLight: '374151',
    accent: 'F59E0B', // Amber 500
  },
  midnight: {
    primary: '6366F1', // Indigo 500
    secondary: 'A5B4FC', // Indigo 200
    background: '0F172A', // Slate 900
    cardBg: '1E293B', // Slate 800
    textDark: 'F8FAFC', // Slate 50
    textLight: '94A3B8', // Slate 400
    accent: '38BDF8', // Sky 400
  },
  sunset: {
    primary: '9A3412', // Orange 800
    secondary: 'EA580C', // Orange 600
    background: 'FFF7ED', // Orange 50
    cardBg: 'FFFFFF',
    textDark: '431407',
    textLight: '78716C',
    accent: 'D97706', // Amber 600
  },
};

export async function exportToPptx(deck: SlideDeckResult, customFileName?: string): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'AI Workplace Productivity Assistant';
  pptx.company = 'Workplace AI Suite';
  pptx.title = deck.title;
  pptx.subject = deck.subtitle;

  const themeColors = THEME_MAP[deck.theme] || THEME_MAP.indigo;
  const isDark = deck.theme === 'midnight';

  deck.slides.forEach((slideData: SlideItem, index: number) => {
    const slide = pptx.addSlide();
    
    // Background color
    slide.background = { color: themeColors.background };

    // Add Speaker Notes if present
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }

    // 1. TITLE SLIDE LAYOUT
    if (slideData.layout === 'title' || index === 0) {
      // Decorative top accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 1.2,
        w: 1.5,
        h: 0.08,
        fill: { color: themeColors.primary },
        line: { color: themeColors.primary },
      });

      // Main Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        h: 2.0,
        fontSize: 36,
        bold: true,
        color: themeColors.textDark,
        fontFace: 'Helvetica Neue, Arial',
        valign: 'middle',
      });

      // Subtitle
      if (slideData.subtitle) {
        slide.addText(slideData.subtitle, {
          x: 0.8,
          y: 3.5,
          w: 11.5,
          h: 1.0,
          fontSize: 20,
          color: themeColors.textLight,
          fontFace: 'Helvetica Neue, Arial',
        });
      }

      // Takeaway pill at bottom
      if (slideData.takeaway) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 5.0,
          w: 11.5,
          h: 1.0,
          fill: { color: themeColors.cardBg },
          line: { color: themeColors.secondary, width: 1 },
          rectRadius: 0.1,
        });

        slide.addText(`Executive Focus: ${slideData.takeaway}`, {
          x: 1.0,
          y: 5.15,
          w: 11.1,
          h: 0.7,
          fontSize: 14,
          italic: true,
          color: themeColors.primary,
        });
      }

      return;
    }

    // SLIDE HEADER (Title & Subtitle)
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.6,
      w: 11.0,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: themeColors.textDark,
      fontFace: 'Helvetica Neue, Arial',
    });

    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 1.25,
        w: 11.0,
        h: 0.4,
        fontSize: 13,
        color: themeColors.textLight,
        fontFace: 'Helvetica Neue, Arial',
      });
    }

    // 2. METRICS LAYOUT
    if (slideData.layout === 'metrics' && slideData.metrics && slideData.metrics.length > 0) {
      const count = slideData.metrics.length;
      const cardWidth = 11.5 / Math.min(count, 4);
      const gap = 0.25;

      slideData.metrics.forEach((metric, mIdx) => {
        const xPos = 0.8 + mIdx * (cardWidth + gap);
        
        // Card Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: 2.0,
          w: cardWidth - gap,
          h: 2.8,
          fill: { color: themeColors.cardBg },
          line: { color: themeColors.secondary, width: 1 },
          rectRadius: 0.1,
        });

        // Value
        slide.addText(metric.value, {
          x: xPos + 0.2,
          y: 2.3,
          w: cardWidth - gap - 0.4,
          h: 1.0,
          fontSize: 32,
          bold: true,
          color: themeColors.primary,
          align: 'center',
        });

        // Label
        slide.addText(metric.label, {
          x: xPos + 0.2,
          y: 3.3,
          w: cardWidth - gap - 0.4,
          h: 0.7,
          fontSize: 13,
          bold: true,
          color: themeColors.textDark,
          align: 'center',
        });

        // Change Tag
        if (metric.change) {
          slide.addText(metric.change, {
            x: xPos + 0.2,
            y: 4.1,
            w: cardWidth - gap - 0.4,
            h: 0.4,
            fontSize: 11,
            color: themeColors.accent,
            align: 'center',
          });
        }
      });
    }
    // 3. CARDS / TIMELINE LAYOUT
    else if ((slideData.layout === 'cards' || slideData.layout === 'timeline') && slideData.cards && slideData.cards.length > 0) {
      const cards = slideData.cards;
      const count = cards.length;
      const cardW = count <= 3 ? 3.6 : 2.7;
      const gap = 0.25;

      cards.slice(0, 4).forEach((card, cIdx) => {
        const xPos = 0.8 + cIdx * (cardW + gap);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: xPos,
          y: 2.0,
          w: cardW,
          h: 3.2,
          fill: { color: themeColors.cardBg },
          line: { color: themeColors.secondary, width: 1 },
          rectRadius: 0.1,
        });

        // Category Tag
        if (card.tag) {
          slide.addText(card.tag.toUpperCase(), {
            x: xPos + 0.2,
            y: 2.2,
            w: cardW - 0.4,
            h: 0.3,
            fontSize: 9,
            bold: true,
            color: themeColors.primary,
          });
        }

        // Card Title
        slide.addText(card.title, {
          x: xPos + 0.2,
          y: 2.55,
          w: cardW - 0.4,
          h: 0.7,
          fontSize: 14,
          bold: true,
          color: themeColors.textDark,
        });

        // Description
        slide.addText(card.description, {
          x: xPos + 0.2,
          y: 3.3,
          w: cardW - 0.4,
          h: 1.7,
          fontSize: 11,
          color: themeColors.textLight,
          valign: 'top',
        });
      });
    }
    // 4. SPLIT 2-COLUMN LAYOUT
    else if (slideData.layout === 'split') {
      const leftItems = slideData.leftContent || [];
      const rightItems = slideData.rightContent || [];

      // Left Box (e.g. Challenge / Current)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 2.0,
        w: 5.6,
        h: 3.3,
        fill: { color: themeColors.cardBg },
        line: { color: themeColors.secondary, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText('Current State / Challenges', {
        x: 1.1,
        y: 2.2,
        w: 5.0,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: isDark ? 'F87171' : 'DC2626',
      });

      slide.addText(
        leftItems.map((item) => ({ text: `•  ${item}\n\n`, options: { fontSize: 11, color: themeColors.textLight } })),
        {
          x: 1.1,
          y: 2.7,
          w: 5.0,
          h: 2.4,
          valign: 'top',
        }
      );

      // Right Box (e.g. Solution / Target)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8,
        y: 2.0,
        w: 5.6,
        h: 3.3,
        fill: { color: themeColors.cardBg },
        line: { color: themeColors.primary, width: 2 },
        rectRadius: 0.1,
      });

      slide.addText('Optimized Solution / Target Impact', {
        x: 7.1,
        y: 2.2,
        w: 5.0,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: themeColors.primary,
      });

      slide.addText(
        rightItems.map((item) => ({ text: `✓  ${item}\n\n`, options: { fontSize: 11, color: themeColors.textDark, bold: true } })),
        {
          x: 7.1,
          y: 2.7,
          w: 5.0,
          h: 2.4,
          valign: 'top',
        }
      );
    }
    // 5. BULLETS / SUMMARY / DEFAULT LAYOUT
    else {
      const bullets = slideData.bullets || [
        'Strategic prioritization across all workplace operations',
        'Direct time savings and actionable project deliverables',
        'Clear ownership tracking and measurable performance targets',
      ];

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.9,
        w: 11.6,
        h: 3.4,
        fill: { color: themeColors.cardBg },
        line: { color: themeColors.secondary, width: 1 },
        rectRadius: 0.1,
      });

      slide.addText(
        bullets.map((b) => ({
          text: `•  ${b}\n\n`,
          options: { fontSize: 13, color: themeColors.textDark, lineSpacing: 24 },
        })),
        {
          x: 1.2,
          y: 2.2,
          w: 10.8,
          h: 2.9,
          valign: 'top',
        }
      );
    }

    // FOOTER (Key Takeaway + Slide Number)
    if (slideData.takeaway) {
      slide.addText(`Key Takeaway: ${slideData.takeaway}`, {
        x: 0.8,
        y: 5.8,
        w: 10.5,
        h: 0.4,
        fontSize: 10,
        italic: true,
        color: themeColors.textLight,
      });
    }

    // Slide number
    slide.addText(`${slideData.slideNumber} / ${deck.totalSlides}`, {
      x: 11.5,
      y: 5.8,
      w: 1.0,
      h: 0.4,
      fontSize: 10,
      align: 'right',
      color: themeColors.textLight,
    });
  });

  const fileName = (customFileName || deck.title || 'Workplace_Presentation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
