import React from 'react';
import {
    Stethoscope,
    Shield,
    Users,
    Award,
    BookOpen,
    Calendar,
    Briefcase,
    Globe,
    Clock,
    Star,
    Coffee,
    Heart
} from 'lucide-react';
import { FeatureCard, FeatureGrid } from './ui';

export const FeatureGridExamples: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Feature Card & Grid Components</h1>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Individual Feature Cards</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FeatureCard
                            icon={<Stethoscope />}
                            title="Default Feature Card"
                            description="With standard styling"
                        />

                        <FeatureCard
                            icon={<Shield />}
                            title="Custom Colors"
                            description="With custom styling"
                            bgColor="bg-blue-50"
                            borderStyle="border border-blue-100"
                            iconColor="text-blue-600"
                            titleColor="text-blue-800"
                            descriptionColor="text-blue-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FeatureCard
                            icon={<BookOpen />}
                            title="Interactive Card"
                            description="This one is clickable"
                            bgColor="bg-indigo-50 hover:bg-indigo-100"
                            borderStyle="border border-indigo-200"
                            iconColor="text-indigo-600"
                            onClick={() => alert('Feature card clicked!')}
                            className="cursor-pointer"
                        />

                        <FeatureCard
                            icon={<Globe />}
                            title="Minimal Card"
                            bgColor="bg-white shadow-md"
                            borderStyle=""
                        />
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Feature Grid with 2 Columns (Default)</h2>
                <FeatureGrid
                    features={[
                        { icon: <Stethoscope />, title: "Medical Sessions", description: "Expert-led workshops" },
                        { icon: <Users />, title: "Networking", description: "Connect with peers" },
                        { icon: <Award />, title: "CME Credits", description: "Earn certifications" },
                        { icon: <Shield />, title: "Secure Access", description: "Protected portal" }
                    ]}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Single Column Layout</h2>
                <FeatureGrid
                    columns={1}
                    gap="gap-4"
                    features={[
                        { icon: <Calendar />, title: "Conference Schedule", description: "Plan your days" },
                        { icon: <Clock />, title: "Time Management", description: "Efficient planning" },
                        { icon: <Briefcase />, title: "Resources", description: "Access learning materials" }
                    ]}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Three Column Layout with Custom Styling</h2>
                <FeatureGrid
                    columns={3}
                    gap="gap-4"
                    features={[
                        {
                            icon: <Coffee />,
                            title: "Refreshments",
                            description: "Stay energized",
                            bgColor: "bg-amber-50",
                            borderStyle: "border border-amber-100",
                            iconColor: "text-amber-600"
                        },
                        {
                            icon: <Star />,
                            title: "Exclusive Content",
                            description: "Premium access",
                            bgColor: "bg-amber-50",
                            borderStyle: "border border-amber-100",
                            iconColor: "text-amber-600"
                        },
                        {
                            icon: <Heart />,
                            title: "Wellness Area",
                            description: "Recharge & relax",
                            bgColor: "bg-amber-50",
                            borderStyle: "border border-amber-100",
                            iconColor: "text-amber-600"
                        }
                    ]}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">No Animation Delay (All Appear at Once)</h2>
                <FeatureGrid
                    staggered={false}
                    features={[
                        { icon: <Stethoscope />, title: "Medical Sessions", description: "Expert-led workshops" },
                        { icon: <Users />, title: "Networking", description: "Connect with peers" },
                        { icon: <Award />, title: "CME Credits", description: "Earn certifications" },
                        { icon: <Shield />, title: "Secure Access", description: "Protected portal" }
                    ]}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Larger Animation Delay Increment</h2>
                <FeatureGrid
                    animationDelayIncrement={0.3}
                    features={[
                        { icon: <Stethoscope />, title: "Medical Sessions", description: "Expert-led workshops" },
                        { icon: <Users />, title: "Networking", description: "Connect with peers" },
                        { icon: <Award />, title: "CME Credits", description: "Earn certifications" },
                        { icon: <Shield />, title: "Secure Access", description: "Protected portal" }
                    ]}
                />
            </section>
        </div>
    );
};