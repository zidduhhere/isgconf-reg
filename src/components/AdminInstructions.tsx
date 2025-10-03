import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Instructions } from './ui';

interface AdminInstructionsProps {
    type?: 'warning' | 'info' | 'success';
    title: string;
    items: string[];
}

export const AdminInstructions: React.FC<AdminInstructionsProps> = ({
    type = 'info',
    title,
    items
}) => {
    // Define styles based on type
    const getStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    bgColor: 'bg-amber-50',
                    borderStyle: 'border border-amber-200',
                    titleStyle: 'font-semibold text-amber-800',
                    textStyle: 'text-amber-700'
                };
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    borderStyle: 'border border-green-200',
                    titleStyle: 'font-semibold text-green-800',
                    textStyle: 'text-green-700'
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-blue-50',
                    borderStyle: 'border border-blue-200',
                    titleStyle: 'font-semibold text-blue-800',
                    textStyle: 'text-blue-700'
                };
        }
    };

    const styles = getStyles();

    return (
        <Instructions
            title={title}
            items={items.map(text => ({ text }))}
            bgColor={styles.bgColor}
            borderStyle={styles.borderStyle}
            titleStyle={styles.titleStyle}
            textStyle={styles.textStyle}
            shadowStyle="shadow"
            footer={
                type === 'warning' && (
                    <div className="flex items-center mt-3 text-amber-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span>These actions cannot be undone. Please proceed with caution.</span>
                    </div>
                )
            }
        />
    );
};