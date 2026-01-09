import React from 'react';
import { Card } from './UIComponents';

export const Documentation: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Platform Documentation</h1>
                <p className="text-gray-600 mt-2">Learn how to use the WeGoChem Intelligent Platform effectively.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                    <h3 className="font-bold text-sm uppercase text-gray-500 mb-2">Getting Started</h3>
                    <a href="#overview" className="block text-sm text-blue-600 hover:underline">Platform Overview</a>
                    <a href="#campaigns" className="block text-sm text-gray-600 hover:text-gray-900">Campaigns</a>
                    <a href="#leads" className="block text-sm text-gray-600 hover:text-gray-900">Managing Leads</a>
                    
                    <h3 className="font-bold text-sm uppercase text-gray-500 mt-6 mb-2">Advanced</h3>
                    <a href="#ai" className="block text-sm text-gray-600 hover:text-gray-900">AI Features</a>
                    <a href="#api" className="block text-sm text-gray-600 hover:text-gray-900">API Access</a>
                </div>

                <div className="md:col-span-3 space-y-8">
                    <section id="overview">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Platform Overview</h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                WeGoChem Intelligent Platform is an integrated CRM and Email Marketing automation tool designed for the chemical industry. It combines high-deliverability email infrastructure with agentic AI to nurture leads automatically.
                            </p>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                <li><strong>Dashboard:</strong> Real-time view of your funnel health.</li>
                                <li><strong>Campaigns:</strong> Visual builder for complex email sequences.</li>
                                <li><strong>Analytics:</strong> Deep dive into ROI and attribution.</li>
                            </ul>
                        </Card>
                    </section>

                    <section id="campaigns">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Campaign Creation</h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Campaigns are the heart of your outreach. We use a node-based editor to create branching logic.
                            </p>
                            <h4 className="font-bold text-sm text-gray-800 mb-2">Steps to create a campaign:</h4>
                            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-2">
                                <li>Navigate to <strong>Campaigns</strong> and click "New Campaign".</li>
                                <li>Define your audience segment in the "Audience" tab.</li>
                                <li>Use the Visual Flow Builder to add emails, delays, and logic conditions.</li>
                                <li>Review the flow and click "Launch".</li>
                            </ol>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
};