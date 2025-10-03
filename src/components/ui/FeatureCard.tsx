import React, { ReactNode } from 'react';

export interface FeatureCardProps {
    /** The icon to display in the feature card */
    icon: ReactNode;
    /** The title of the feature */
    title: string;
    /** A short description of the feature */
    description?: string;
    /** Background color/opacity class */
    bgColor?: string;
    /** Border style class */
    borderStyle?: string;
    /** Icon color class */
    iconColor?: string;
    /** Title text color class */
    titleColor?: string;
    /** Description text color class */
    descriptionColor?: string;
    /** Animation delay in seconds (as a string) */
    animationDelay?: string;
    /** Additional CSS classes */
    className?: string;
    /** Optional click handler */
    onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    bgColor = 'bg-white/60',
    borderStyle = 'border border-white/20',
    iconColor = 'text-primary-600',
    titleColor = 'text-neutral-900',
    descriptionColor = 'text-neutral-600',
    animationDelay,
    className = '',
    onClick
}) => {
    return (
        <div
            className={`${bgColor} backdrop-blur-sm rounded-lg p-3 ${borderStyle} animate-scale-in ${className}`}
            style={animationDelay ? { animationDelay: `${animationDelay}s` } : undefined}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
                <div className="text-left">
                    <h4 className={`font-medium ${titleColor} text-sm`}>{title}</h4>
                    {description && <p className={`text-xs ${descriptionColor}`}>{description}</p>}
                </div>
            </div>
        </div>
    );
};