import React from 'react';
import { FeatureCard, FeatureCardProps } from './FeatureCard';

export interface FeatureGridProps {
    /** Array of feature items */
    features: Omit<FeatureCardProps, 'animationDelay'>[];
    /** Number of columns in the grid */
    columns?: 1 | 2 | 3 | 4;
    /** Gap between grid items */
    gap?: 'gap-2' | 'gap-3' | 'gap-4' | 'gap-5' | 'gap-6';
    /** Enable staggered animation delays */
    staggered?: boolean;
    /** Base animation delay increment in seconds */
    animationDelayIncrement?: number;
    /** Additional CSS classes */
    className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
    features,
    columns = 2,
    gap = 'gap-3',
    staggered = true,
    animationDelayIncrement = 0.1,
    className = ''
}) => {
    // Define grid columns class based on the columns prop
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
        <div className={`grid ${getGridColsClass()} ${gap} ${className}`}>
            {features.map((feature, index) => (
                <FeatureCard
                    key={index}
                    {...feature}
                    animationDelay={staggered ? (index * animationDelayIncrement).toString() : undefined}
                />
            ))}
        </div>
    );
};