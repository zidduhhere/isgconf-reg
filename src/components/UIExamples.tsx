import React from 'react';
import { ImageIcon, Users, Building } from 'lucide-react';
import { ImagePlaceholder, Instructions } from './ui';
import { AdminInstructions } from './AdminInstructions';

export const UIExamples: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">UI Component Examples</h1>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Image Placeholders</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImagePlaceholder
                        title="Conference Photos"
                        subtitle="Coming soon"
                        icon={<ImageIcon />}
                    />

                    <ImagePlaceholder
                        gradientFrom="from-purple-100"
                        gradientTo="to-purple-200"
                        borderColor="border-purple-300"
                        iconBgColor="bg-purple-300"
                        iconColor="text-purple-600"
                        title="Speakers"
                        subtitle="Expert presentations"
                        titleColor="text-purple-700"
                        subtitleColor="text-purple-600"
                        icon={<Users />}
                    />

                    <ImagePlaceholder
                        gradientFrom="from-green-100"
                        gradientTo="to-green-200"
                        borderColor="border-green-300"
                        iconBgColor="bg-green-300"
                        iconColor="text-green-600"
                        title="Venue Map"
                        subtitle="Interactive floor plan"
                        titleColor="text-green-700"
                        subtitleColor="text-green-600"
                        icon={<Building />}
                        height="h-64"
                    />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Instructions
                        title="Meal Pass Usage"
                        items={[
                            { text: "All meal cards are available anytime" },
                            { text: "Tap to coupon your meal voucher" },
                            { text: "Show the GREEN card to food servers" },
                            { text: "Each meal can only be couponed once" },
                            { text: "Claims expire after 15 minutes" },
                            { text: "Family coupons are for all members together", isHighlighted: true }
                        ]}
                    />

                    <Instructions
                        title="Custom Styled Instructions"
                        items={[
                            { text: "Primary instruction point" },
                            { text: "Secondary instruction point" },
                            { text: "Highlighted instruction", isHighlighted: true }
                        ]}
                        bgColor="bg-indigo-50"
                        borderStyle="border border-indigo-200"
                        shadowStyle="shadow-md"
                        titleStyle="font-bold text-indigo-800"
                        textStyle="text-indigo-700"
                        highlightedTextStyle="text-pink-600 font-bold"
                    />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Admin Instructions</h2>
                <div className="grid grid-cols-1 gap-4">
                    <AdminInstructions
                        type="info"
                        title="Information Notice"
                        items={[
                            "This is an informational notice",
                            "It provides helpful context to users",
                            "Use it for neutral information"
                        ]}
                    />

                    <AdminInstructions
                        type="warning"
                        title="Warning Notice"
                        items={[
                            "This is a warning notice",
                            "It alerts users to potential issues",
                            "Use it for actions that need caution"
                        ]}
                    />

                    <AdminInstructions
                        type="success"
                        title="Success Notice"
                        items={[
                            "This is a success notice",
                            "It confirms positive outcomes",
                            "Use it for completion messages"
                        ]}
                    />
                </div>
            </section>
        </div>
    );
};