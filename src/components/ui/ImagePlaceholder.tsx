import React, { ReactNode } from 'react';

export interface ImagePlaceholderProps {
    /** The gradient colors to use for the background */
    gradientFrom?: string;
    gradientTo?: string;
    /** The border color for the dashed border */
    borderColor?: string;
    /** The icon to display, can be any React node */
    icon: ReactNode;
    /** The background color for the icon container */
    iconBgColor?: string;
    /** The text color for the icon */
    iconColor?: string;
    /** The title to display */
    title: string;
    /** The subtitle or description to display */
    subtitle?: string;
    /** The text color for the title */
    titleColor?: string;
    /** The text color for the subtitle */
    subtitleColor?: string;
    /** Optional height class, defaults to 'h-48' */
    height?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
    gradientFrom = 'from-blue-100',
    gradientTo = 'to-blue-200',
    borderColor = 'border-blue-300',
    iconBgColor = 'bg-blue-300',
    iconColor = 'text-blue-600',
    titleColor = 'text-blue-700',
    subtitleColor = 'text-blue-600',
    title,
    subtitle,
    icon,
    height = 'h-48'
}) => {
    return (
        <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl ${height} flex items-center justify-center border-2 border-dashed ${borderColor}`}>
            <div className="text-center">
                <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <div className={`w-8 h-8 ${iconColor}`}>{icon}</div>
                </div>
                <p className={`font-medium ${titleColor}`}>{title}</p>
                {subtitle && <p className={`text-sm mt-1 ${subtitleColor}`}>{subtitle}</p>}
            </div>
        </div>
    );
};