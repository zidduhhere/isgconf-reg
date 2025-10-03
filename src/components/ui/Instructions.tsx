import React, { ReactNode } from 'react';

export interface InstructionItem {
    text: string;
    isHighlighted?: boolean;
}

export interface InstructionsProps {
    /** Title of the instructions box */
    title: string;
    /** Array of instruction items */
    items: InstructionItem[];
    /** Custom background style */
    bgColor?: string;
    /** Custom border style */
    borderStyle?: string;
    /** Custom shadow style */
    shadowStyle?: string;
    /** Custom styles for title text */
    titleStyle?: string;
    /** Custom styles for regular instruction text */
    textStyle?: string;
    /** Custom styles for highlighted instruction text */
    highlightedTextStyle?: string;
    /** Optional additional content to render at the bottom */
    footer?: ReactNode;
}

export const Instructions: React.FC<InstructionsProps> = ({
    title = 'How it works:',
    items,
    bgColor = 'bg-white/80',
    borderStyle = 'border border-white/20',
    shadowStyle = 'shadow-sm',
    titleStyle = 'font-semibold text-gray-900',
    textStyle = 'text-gray-600',
    highlightedTextStyle = 'text-purple-600 font-medium',
    footer
}) => {
    return (
        <div className={`backdrop-blur-lg rounded-xl p-4 ${bgColor} ${shadowStyle} ${borderStyle}`}>
            <h3 className={`${titleStyle} mb-2`}>{title}</h3>
            <ul className="text-sm space-y-1">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className={item.isHighlighted ? highlightedTextStyle : textStyle}
                    >
                        • {item.text}
                    </li>
                ))}
            </ul>
            {footer && <div className="mt-3">{footer}</div>}
        </div>
    );
};