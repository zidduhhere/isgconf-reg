import React, { ReactNode } from 'react';

export interface EventDetailItem {
    /** Label for the detail item */
    label: string;
    /** Value for the detail item */
    value: string;
}

export interface EventDetailsProps {
    /** Title of the event details box */
    title: string;
    /** Array of event detail items */
    details: EventDetailItem[];
    /** Background gradient (from color) */
    gradientFrom?: string;
    /** Background gradient (to color) */
    gradientTo?: string;
    /** Text color for title */
    titleColor?: string;
    /** Text color for labels */
    labelColor?: string;
    /** Text color for values */
    valueColor?: string;
    /** Optional additional content to render at the bottom */
    footer?: ReactNode;
    /** Number of columns for the grid */
    columns?: 1 | 2 | 3 | 4;
    /** Optional className for additional styling */
    className?: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
    title,
    details,
    gradientFrom = 'from-primary-600',
    gradientTo = 'to-primary-700',
    titleColor = 'text-white',
    labelColor = 'text-primary-200',
    valueColor = 'text-white',
    footer,
    columns = 2,
    className = '',
}) => {
    const getGridColsClass = () => {
        switch (columns) {
            case 1: return 'grid-cols-1';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            case 2:
            default: return 'grid-cols-2';
        }
    };

    return (
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl p-4 ${className}`}>
            <h3 className={`text-base font-semibold mb-2 ${titleColor}`}>{title}</h3>
            <div className={`grid ${getGridColsClass()} gap-3 text-xs`}>
                {details.map((item, index) => (
                    <div key={index}>
                        <p className={labelColor}>{item.label}</p>
                        <p className={`font-medium ${valueColor}`}>{item.value}</p>
                    </div>
                ))}
            </div>
            {footer && <div className="mt-3">{footer}</div>}
        </div>
    );
};