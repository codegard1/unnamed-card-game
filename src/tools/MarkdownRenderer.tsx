import React from 'react';
import { Box, Typography, Link, List, ListItem, ListItemText } from '@mui/material';

interface MarkdownRendererProps {
  content: string;
}

/**
 * MarkdownRenderer - A lightweight markdown renderer for React/MUI
 * 
 * Supports:
 * - Headings: # Heading 1, ## Heading 2, ### Heading 3
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Links: [text](url)
 * - Unordered lists: - item, * item, + item
 * - Ordered lists: 1. item, 2. item, etc.
 * - Line breaks (empty lines create spacing)
 * 
 * @component
 * @param content - The markdown string to render
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines and use them for spacing
      if (line.trim() === '') {
        if (i > 0 && i < lines.length - 1) {
          elements.push(<Box key={`spacer-${i}`} sx={{ height: '0.5rem' }} />);
        }
        i++;
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const variant = level === 1 ? 'h5' : level === 2 ? 'h6' : 'subtitle1';
        elements.push(
          <Typography
            key={`heading-${i}`}
            variant={variant}
            sx={{ fontWeight: 600, color: 'primary.main', mt: 1.5, mb: 1 }}
          >
            {renderInlineMarkdown(text)}
          </Typography>
        );
        i++;
        continue;
      }

      // Unordered lists
      const unorderedListMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      if (unorderedListMatch) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s+(.+)$/)) {
          const match = lines[i].match(/^[\s]*[-*+]\s+(.+)$/);
          if (match) {
            listItems.push(match[1]);
          }
          i++;
        }
        elements.push(
          <List
            key={`list-${i}`}
            sx={{ pl: 2, py: 0.5, '& .MuiListItem-root': { py: 0.25 } }}
          >
            {listItems.map((item, idx) => (
              <ListItem key={`item-${idx}`} sx={{ display: 'list-item' }}>
                <ListItemText
                  primary={renderInlineMarkdown(item)}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        );
        continue;
      }

      // Ordered lists
      const orderedListMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (orderedListMatch) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].match(/^[\s]*\d+\.\s+(.+)$/)) {
          const match = lines[i].match(/^[\s]*\d+\.\s+(.+)$/);
          if (match) {
            listItems.push(match[1]);
          }
          i++;
        }
        elements.push(
          <List
            key={`list-ordered-${i}`}
            sx={{ pl: 2, py: 0.5, '& .MuiListItem-root': { py: 0.25 } }}
          >
            {listItems.map((item, idx) => (
              <ListItem key={`ordered-item-${idx}`} sx={{ display: 'list-item', listStyleType: 'decimal' }}>
                <ListItemText
                  primary={renderInlineMarkdown(item)}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        );
        continue;
      }

      // Regular paragraph
      elements.push(
        <Typography
          key={`para-${i}`}
          variant="body2"
          sx={{ mb: 1, color: '#333', lineHeight: 1.6 }}
        >
          {renderInlineMarkdown(line)}
        </Typography>
      );
      i++;
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Pattern to match bold, italic, and links
    const pattern = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|\[(.*?)\]\((.*?)\)/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      if (match[1]) {
        // Bold: **text** or __text__
        parts.push(
          <strong key={`bold-${match.index}`}>{match[2]}</strong>
        );
      } else if (match[3]) {
        // Italic: *text* or _text_
        parts.push(
          <em key={`italic-${match.index}`}>{match[4]}</em>
        );
      } else if (match[5]) {
        // Link: [text](url)
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={match[6]}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ wordBreak: 'break-all' }}
          >
            {match[5]}
          </Link>
        );
      }

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <Box>{parseMarkdown(content)}</Box>;
};

export default MarkdownRenderer;
