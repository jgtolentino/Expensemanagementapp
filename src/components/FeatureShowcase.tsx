import React from 'react';

const PhoneMockup = ({ 
  children, 
  title, 
  description 
}: { 
  children: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center max-w-[280px]">
        <h3 className="text-[#386641] mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="relative">
        {/* Phone frame */}
        <div className="w-[280px] h-[570px] bg-black rounded-[40px] p-3 shadow-2xl">
          <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[28px] bg-black rounded-b-3xl z-10"></div>
            {/* Content */}
            <div className="w-full h-full overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <div className="mb-6">
      <div className="text-gray-500 mb-1">Welcome back</div>
      <h2 className="text-[#386641]">Account Manager</h2>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="text-gray-500 mb-1">Active Quotes</div>
      <div className="text-[#386641] text-3xl">12</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="text-gray-500 mb-1">Pending Approval</div>
      <div className="text-[#D4AC0D] text-3xl">5</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-gray-500 mb-1">Total Value</div>
      <div className="text-[#386641] text-3xl">$47,250</div>
    </div>
  </div>
);

const QuoteCreationScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <h2 className="text-[#386641] mb-4">New Quote</h2>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <label className="text-gray-600 block mb-2">Client Name</label>
      <div className="bg-gray-50 rounded px-3 py-2">Acme Corp</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <label className="text-gray-600 block mb-2">Project</label>
      <div className="bg-gray-50 rounded px-3 py-2">Website Redesign</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="text-gray-600">Line Items</div>
        <div className="w-6 h-6 rounded-full bg-[#386641] text-white flex items-center justify-center text-sm">+</div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm">Design Phase</span>
          <span className="text-[#386641]">$5,000</span>
        </div>
        <div className="flex justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm">Development</span>
          <span className="text-[#386641]">$12,000</span>
        </div>
      </div>
    </div>
  </div>
);

const ApprovalScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[#386641]">Approvals</h2>
      <div className="bg-[#D4AC0D] text-white text-sm px-3 py-1 rounded-full">FD</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[#386641]">Q-2024-003</div>
          <div className="text-sm text-gray-600">Acme Corp</div>
        </div>
        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Pending</div>
      </div>
      <div className="text-[#386641] text-xl">$17,000</div>
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-green-600 text-white text-center py-2 rounded text-sm">Approve</div>
        <div className="flex-1 bg-red-600 text-white text-center py-2 rounded text-sm">Reject</div>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-[#386641]">Q-2024-002</div>
          <div className="text-sm text-gray-600">TechStart Inc</div>
        </div>
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</div>
      </div>
      <div className="text-[#386641] text-xl">$8,500</div>
    </div>
  </div>
);

const LineItemsScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <h2 className="text-[#386641] mb-4">Quote Details</h2>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="text-gray-600 mb-1">Quote #Q-2024-003</div>
      <div className="text-[#386641] text-2xl">$17,000</div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-gray-600 mb-3">Line Items</div>
      <div className="space-y-3">
        <div className="border-b pb-2">
          <div className="flex justify-between mb-1">
            <span>Design Phase</span>
            <span className="text-[#386641]">$5,000</span>
          </div>
          <div className="text-sm text-gray-500">2 weeks @ $2,500/week</div>
        </div>
        <div className="border-b pb-2">
          <div className="flex justify-between mb-1">
            <span>Development</span>
            <span className="text-[#386641]">$12,000</span>
          </div>
          <div className="text-sm text-gray-500">4 weeks @ $3,000/week</div>
        </div>
        <div className="pt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="text-[#386641] text-xl">$17,000</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RoleSwitchScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <h2 className="text-[#386641] mb-6 text-center">Select Your Role</h2>
    
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-[#386641]">
        <div className="w-16 h-16 rounded-full bg-[#386641] text-white flex items-center justify-center text-2xl mx-auto mb-3">
          AM
        </div>
        <div className="text-center text-[#386641]">Account Manager</div>
        <div className="text-center text-sm text-gray-600 mt-2">Create and manage quotes</div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-2xl mx-auto mb-3">
          FD
        </div>
        <div className="text-center text-gray-600">Finance Director</div>
        <div className="text-center text-sm text-gray-600 mt-2">Review and approve quotes</div>
      </div>
    </div>
  </div>
);

const AnalyticsScreen = () => (
  <div className="w-full h-full bg-[#F2F7F2] p-6 pt-12">
    <h2 className="text-[#386641] mb-4">Analytics</h2>
    
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="text-gray-600 mb-3">Quote Status</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 bg-green-500 rounded"></div>
          <span className="text-sm">Approved (7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-6 bg-yellow-500 rounded"></div>
          <span className="text-sm">Pending (5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-red-500 rounded"></div>
          <span className="text-sm">Rejected (2)</span>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-gray-600 mb-3">Monthly Trend</div>
      <div className="flex items-end gap-2 h-32">
        <div className="flex-1 bg-[#386641] rounded-t" style={{height: '60%'}}></div>
        <div className="flex-1 bg-[#386641] rounded-t" style={{height: '75%'}}></div>
        <div className="flex-1 bg-[#386641] rounded-t" style={{height: '90%'}}></div>
        <div className="flex-1 bg-[#D4AC0D] rounded-t" style={{height: '100%'}}></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
      </div>
    </div>
  </div>
);

export default function FeatureShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F7F2] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-[#386641] mb-4">Rate Card Pro</h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Professional expense management and quote approval system designed for modern teams
          </p>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <PhoneMockup
            title="Real-time Dashboard"
            description="Track active quotes, pending approvals, and total value at a glance"
          >
            <DashboardScreen />
          </PhoneMockup>

          <PhoneMockup
            title="Quick Quote Creation"
            description="Build detailed quotes with multiple line items in seconds"
          >
            <QuoteCreationScreen />
          </PhoneMockup>

          <PhoneMockup
            title="Streamlined Approvals"
            description="Finance Directors can review and approve quotes with one tap"
          >
            <ApprovalScreen />
          </PhoneMockup>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <PhoneMockup
            title="Detailed Line Items"
            description="Break down quotes with itemized pricing and descriptions"
          >
            <LineItemsScreen />
          </PhoneMockup>

          <PhoneMockup
            title="Role-Based Access"
            description="Switch between Account Manager and Finance Director views"
          >
            <RoleSwitchScreen />
          </PhoneMockup>

          <PhoneMockup
            title="Visual Analytics"
            description="Monitor quote performance and trends with interactive charts"
          >
            <AnalyticsScreen />
          </PhoneMockup>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-[#386641] mb-4">Ready to streamline your quote management?</h2>
          <p className="text-gray-600 mb-6">Join teams who trust Rate Card Pro for their expense management</p>
          <button className="bg-[#386641] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
