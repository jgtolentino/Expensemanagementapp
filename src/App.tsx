import React, { useState } from "react";
import './styles/deakin-fluent-theme.css';

// --- Deakin Enterprise 365 token map ---
const tokens = {
  colors: {
    brand: {
      primaryBlue: "#0078D4",
      plannerPurple: "#4B38B3",
      fabricTeal: "#00B294",
      deakinBlack: "#000000",
      financeGold: "#F2C811",
    },
    neutral: {
      white: "#FFFFFF",
      canvasBackground: "#F3F2F1",
      surfacePrimary: "#FFFFFF",
      borderLight: "#EDEBE9",
      borderActive: "#8A8886",
      textPrimary: "#252423",
      textSecondary: "#605E5C",
      textTertiary: "#A19F9D",
    },
  },
};

// --- ACTUAL TBWA Finance PPM Data (From WBS) ---
const financePlan = {
  name: "Month-End Closing – December 2025",
  project: "PRJ-MEC-2025-M12",
  owner: "CKVC (Cherry Kate Veracruz)",
  buckets: [
    {
      id: "phase-1",
      name: "Phase I: Initial & Compliance (WD1–WD2)",
      color: "#F8D7E0",
      stage: "Preparation",
      tasks: [
        {
          id: "CT-0001",
          title: "CT-0001 · Process Payroll, Final Pay, SL Conversions",
          wbs: "1.1.1",
          label: "Compliance",
          owner: "RIM",
          accountable: "CKVC",
          wd: 1,
          status: "Complete",
          progress: 100,
          checklistTotal: 3,
          checklistDone: 3,
        },
        {
          id: "CT-0002",
          title: "CT-0002 · Calculate Tax Provision and PPB Provision",
          wbs: "1.1.2",
          label: "Tax",
          owner: "RIM",
          accountable: "CKVC",
          wd: 1,
          status: "Complete",
          progress: 100,
        },
        {
          id: "CT-0003",
          title: "CT-0003 · Input VAT, WHT, and compile supporting docs",
          wbs: "1.1.3",
          label: "Tax",
          owner: "JLI",
          accountable: "CKVC",
          wd: 1,
          status: "In Progress",
          progress: 75,
          checklistTotal: 4,
          checklistDone: 3,
        },
        {
          id: "CT-0004",
          title: "CT-0004 · Accrue December utilities and rental",
          wbs: "1.1.4",
          label: "Accruals",
          owner: "LAS",
          accountable: "CKVC",
          wd: 1,
          status: "Complete",
          progress: 100,
        },
        {
          id: "CT-0005",
          title: "CT-0005 · Liquidate outstanding CAs before cut-off",
          wbs: "1.1.5",
          label: "Compliance",
          owner: "LAS",
          accountable: "CKVC",
          wd: 1,
          status: "At Risk",
          progress: 60,
        },
      ],
    },
    {
      id: "phase-2",
      name: "Phase II: Accruals & Amortizations (WD2–WD3)",
      color: "#D5E6F9",
      stage: "Processing",
      tasks: [
        {
          id: "CT-0010",
          title: "CT-0010 · Record MEC accruals (bonuses, 13th month)",
          wbs: "1.2.1",
          label: "Accruals",
          owner: "RIM",
          accountable: "CKVC",
          wd: 2,
          status: "In Progress",
          progress: 40,
          checklistTotal: 5,
          checklistDone: 2,
        },
        {
          id: "CT-0011",
          title: "CT-0011 · Accrue audit fees and professional services",
          wbs: "1.2.2",
          label: "Accruals",
          owner: "BOM",
          accountable: "CKVC",
          wd: 2,
          status: "Not Started",
          progress: 0,
        },
        {
          id: "CT-0015",
          title: "CT-0015 · Post depreciation and amortization entries",
          wbs: "1.2.6",
          label: "Depreciation",
          owner: "JMSM",
          accountable: "CKVC",
          wd: 2,
          status: "Not Started",
          progress: 0,
        },
      ],
    },
    {
      id: "phase-3",
      name: "Phase III: WIP & OOP (WD3–WD4)",
      color: "#FEF3C7",
      stage: "Reconciliation",
      tasks: [
        {
          id: "CT-0023",
          title: "CT-0023 · WIP roll-forward and client reconciliations",
          wbs: "2.1.1",
          label: "WIP",
          owner: "JRMO",
          accountable: "CKVC",
          wd: 3,
          status: "Not Started",
          progress: 0,
          checklistTotal: 6,
          checklistDone: 0,
        },
        {
          id: "CT-0025",
          title: "CT-0025 · Review December WIP schedule vs GL",
          wbs: "2.1.3",
          label: "WIP",
          owner: "JRMO",
          accountable: "BOM",
          wd: 3,
          status: "Not Started",
          progress: 0,
        },
        {
          id: "CT-0027",
          title: "CT-0027 · OOP review and variance analysis",
          wbs: "2.2.1",
          label: "OOP",
          owner: "BOM",
          accountable: "CKVC",
          wd: 4,
          status: "Not Started",
          progress: 0,
        },
      ],
    },
    {
      id: "phase-4",
      name: "Phase IV: Final Adjustments & Close (WD5–WD7)",
      color: "#E0F7F3",
      stage: "Close",
      tasks: [
        {
          id: "CT-0034",
          title: "CT-0034 · Final MEC adjustments and true-ups",
          wbs: "3.1.1",
          label: "Adjustments",
          owner: "RIM",
          accountable: "CKVC",
          wd: 5,
          status: "Not Started",
          progress: 0,
          checklistTotal: 4,
          checklistDone: 0,
        },
        {
          id: "CT-0035",
          title: "CT-0035 · Consolidate TB and finalize GL close",
          wbs: "3.1.2",
          label: "Close",
          owner: "JPAL",
          accountable: "CKVC",
          wd: 5,
          status: "Not Started",
          progress: 0,
        },
        {
          id: "MS-006",
          title: "MS-006 · ✓ TB Sign-Off (WD+5 Close Achieved)",
          wbs: "3.2",
          label: "Milestone",
          owner: "CKVC",
          accountable: "CSD",
          wd: 7,
          status: "Not Started",
          progress: 0,
        },
        {
          id: "CT-0036",
          title: "CT-0036 · Prepare Flash Report for Regional CFO",
          wbs: "4.1.1",
          label: "Reporting",
          owner: "JPAL",
          accountable: "CKVC",
          wd: 6,
          status: "Not Started",
          progress: 0,
        },
      ],
    },
  ],
};

// --- Layout Components ---

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const TopBar: React.FC = () => (
  <header className="top-bar">
    <button className="btn-icon btn-icon--white" aria-label="Menu">
      ☰
    </button>
    <div className="top-bar__logo">DEAKIN UNIVERSITY</div>
    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.24)', margin: '0 12px' }} />
    <div className="top-bar__title">Planner · Finance PPM – Month-End Close</div>
    
    <div className="top-bar__spacer" />
    
    <input 
      type="search" 
      className="top-bar__search" 
      placeholder="Search tasks..."
    />
    
    <button className="btn-icon btn-icon--white" aria-label="Notifications">
      🔔
    </button>
    <div className="top-bar__profile">
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4B38B3, #0078D4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        color: 'white',
        border: '2px solid rgba(255,255,255,0.7)'
      }}>
        CK
      </div>
      <span>CKVC</span>
    </div>
  </header>
);

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <aside className={`sidebar ${expanded ? 'sidebar--expanded' : ''}`}>
      <div style={{ marginBottom: 16 }}>
        <NavItem title="My Day" icon="🌅" />
        <NavItem title="My Tasks" icon="📋" />
        <NavItem title="My Plans" icon="🗂" />
      </div>
      
      <div style={{ fontSize: 11, fontWeight: 600, padding: '8px 10px', color: '#A19F9D', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Pinned
      </div>
      
      <NavItem title="Month-End Closing – December 2025" icon="🗒" active />
      
      <button className="btn btn-secondary" style={{ margin: '16px 8px', width: 'calc(100% - 16px)' }}>
        + New plan
      </button>
    </aside>
  );
};

const NavItem: React.FC<{ title: string; icon: string; active?: boolean }> = ({ title, icon, active }) => (
  <a
    href="#"
    className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
    onClick={(e) => e.preventDefault()}
  >
    <span className="sidebar__icon">{icon}</span>
    <span>{title}</span>
  </a>
);

// --- Tab Navigation ---

const TabStrip: React.FC<{ active: string; onChange: (tab: string) => void }> = ({ active, onChange }) => {
  const tabs = ["Board", "Schedule", "Grid", "Charts"];
  return (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${tokens.colors.neutral.borderLight}`,
      marginBottom: 16,
    }}>
      {tabs.map((t) => {
        const isActive = t === active;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              borderBottom: isActive ? `3px solid ${tokens.colors.brand.plannerPurple}` : '3px solid transparent',
              color: isActive ? tokens.colors.brand.plannerPurple : tokens.colors.neutral.textSecondary,
              transition: 'all 0.15s ease',
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
};

// --- Board View (Kanban) ---

const BoardView: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
      {financePlan.buckets.map((bucket) => (
        <div
          key={bucket.id}
          style={{
            minWidth: 300,
            maxWidth: 320,
            background: tokens.colors.neutral.surfacePrimary,
            borderRadius: 8,
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: 12,
            borderBottom: `1px solid ${tokens.colors.neutral.borderLight}`,
            background: bucket.color,
            borderRadius: '8px 8px 0 0',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              {bucket.name}
            </div>
            <div style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary }}>
              {bucket.tasks.length} tasks · {bucket.stage}
            </div>
          </div>
          
          <div style={{ padding: 8, flex: 1, overflowY: 'auto' }}>
            {bucket.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          
          <button className="btn btn-secondary" style={{ margin: 8 }}>
            + Add task
          </button>
        </div>
      ))}
    </div>
  );
};

const TaskCard: React.FC<{ task: any }> = ({ task }) => {
  const statusColors = {
    'Complete': { bg: '#e4f4e4', text: '#107c10', border: '#107c10' },
    'In Progress': { bg: '#e5f1fb', text: '#005a9e', border: '#0078d4' },
    'At Risk': { bg: '#fff4dd', text: '#f59e0b', border: '#f59e0b' },
    'Not Started': { bg: '#f3f3f3', text: '#737373', border: '#d4d4d4' },
  };
  
  const statusColor = statusColors[task.status as keyof typeof statusColors] || statusColors['Not Started'];
  
  return (
    <div className="task-card" style={{ marginBottom: 8 }}>
      <div className="tag tag--gold" style={{ marginBottom: 8 }}>
        {task.label}
      </div>
      
      <div className="task-card__title" style={{ marginBottom: 8 }}>
        {task.title}
      </div>
      
      <div style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary, marginBottom: 8 }}>
        WBS: {task.wbs} • WD{task.wd}
      </div>
      
      {task.checklistTotal && (
        <div style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary, marginBottom: 8 }}>
          ✓ {task.checklistDone} / {task.checklistTotal} checklist items
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          background: statusColor.bg,
          color: statusColor.text,
          border: `1px solid ${statusColor.border}`,
        }}>
          {task.status}
        </span>
        
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00b294, #0078d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: 'white',
        }}>
          {task.owner}
        </div>
      </div>
    </div>
  );
};

// --- Schedule View (Calendar) ---

const ScheduleView: React.FC = () => {
  const weeks = [
    ["", "1", "2", "3", "4", "5", "6"],
    ["7", "8", "9", "10", "11", "12", "13"],
    ["14", "15", "16", "17", "18", "19", "20"],
    ["21", "22", "23", "24", "25", "26", "27"],
    ["28", "29", "30", "31", "", "", ""],
  ];

  // Group tasks by WD (working day)
  const tasksByDay: { [key: string]: any[] } = {};
  financePlan.buckets.forEach(bucket => {
    bucket.tasks.forEach(task => {
      const day = task.wd.toString();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push({ ...task, bucketColor: bucket.color });
    });
  });

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{
        flex: 2,
        background: tokens.colors.neutral.surfacePrimary,
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        padding: 12,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-icon">‹</button>
            <div style={{ fontWeight: 600, fontSize: 14 }}>December 2025</div>
            <button className="btn-icon">›</button>
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th key={d} style={{
                  padding: 8,
                  textAlign: 'left',
                  fontWeight: 600,
                  color: tokens.colors.neutral.textSecondary,
                  fontSize: 11,
                }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((day, j) => {
                  const tasksOnDay = tasksByDay[day] || [];
                  return (
                    <td key={j} style={{
                      height: 80,
                      verticalAlign: 'top',
                      borderTop: `1px solid ${tokens.colors.neutral.borderLight}`,
                      padding: 4,
                    }}>
                      <div style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary, marginBottom: 4 }}>
                        {day}
                      </div>
                      {tasksOnDay.slice(0, 2).map((task, idx) => (
                        <div key={idx} style={{
                          height: 3,
                          background: task.bucketColor,
                          borderRadius: 999,
                          marginBottom: 2,
                        }} />
                      ))}
                      {tasksOnDay.length > 2 && (
                        <div style={{ fontSize: 9, color: tokens.colors.neutral.textTertiary }}>
                          +{tasksOnDay.length - 2} more
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ flex: 1 }}>
        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }}>
          + Add task
        </button>
        
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Upcoming Tasks
        </div>
        
        {financePlan.buckets.slice(0, 2).map((bucket) => (
          <div key={bucket.id} style={{
            background: tokens.colors.neutral.surfacePrimary,
            borderRadius: 6,
            padding: 8,
            marginBottom: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary, marginBottom: 4 }}>
              {bucket.name}
            </div>
            {bucket.tasks.slice(0, 2).map((task) => (
              <div key={task.id} style={{
                fontSize: 12,
                padding: '4px 0',
                borderBottom: `1px solid ${tokens.colors.neutral.borderLight}`,
              }}>
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Grid View (Table) ---

const GridView: React.FC = () => {
  const allTasks = financePlan.buckets.flatMap(bucket => 
    bucket.tasks.map(task => ({ ...task, phase: bucket.name }))
  );
  
  return (
    <div className="card">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>WBS</th>
            <th style={{ width: 60 }}>WD</th>
            <th>Task Name</th>
            <th style={{ width: 100 }}>Owner</th>
            <th style={{ width: 120 }}>Status</th>
            <th style={{ width: 100 }}>Progress</th>
            <th style={{ width: 100 }}>Checklist</th>
          </tr>
        </thead>
        <tbody>
          {allTasks.map((task) => (
            <tr key={task.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{task.wbs}</td>
              <td>WD{task.wd}</td>
              <td>{task.title}</td>
              <td>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0078d4, #00b294)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'white',
                  }}>
                    {task.owner}
                  </div>
                  <span style={{ fontSize: 12 }}>{task.owner}</span>
                </div>
              </td>
              <td>
                <span className="tag" style={{
                  background: task.status === 'Complete' ? '#e4f4e4' :
                             task.status === 'In Progress' ? '#e5f1fb' :
                             task.status === 'At Risk' ? '#fff4dd' : '#f3f3f3',
                  color: task.status === 'Complete' ? '#107c10' :
                         task.status === 'In Progress' ? '#005a9e' :
                         task.status === 'At Risk' ? '#f59e0b' : '#737373',
                  borderColor: task.status === 'Complete' ? '#107c10' :
                               task.status === 'In Progress' ? '#0078d4' :
                               task.status === 'At Risk' ? '#f59e0b' : '#d4d4d4',
                }}>
                  {task.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    height: 6,
                    background: '#e5e5e5',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${task.progress}%`,
                      height: '100%',
                      background: task.progress === 100 ? '#107c10' : '#0078d4',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#737373', minWidth: 30 }}>
                    {task.progress}%
                  </span>
                </div>
              </td>
              <td style={{ fontSize: 11, color: tokens.colors.neutral.textSecondary }}>
                {task.checklistTotal ? `${task.checklistDone ?? 0} / ${task.checklistTotal}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Charts View ---

const ChartsView: React.FC = () => {
  const allTasks = financePlan.buckets.flatMap(b => b.tasks);
  const statusCounts = {
    'Complete': allTasks.filter(t => t.status === 'Complete').length,
    'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
    'At Risk': allTasks.filter(t => t.status === 'At Risk').length,
    'Not Started': allTasks.filter(t => t.status === 'Not Started').length,
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div className="card">
        <div className="card__header">Status Distribution</div>
        <div style={{ padding: 16 }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span>{status}</span>
                <span>{count}</span>
              </div>
              <div style={{
                height: 8,
                background: '#e5e5e5',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(count / allTasks.length) * 100}%`,
                  height: '100%',
                  background: status === 'Complete' ? '#107c10' :
                             status === 'In Progress' ? '#0078d4' :
                             status === 'At Risk' ? '#f59e0b' : '#737373',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <div className="card__header">Tasks by Phase</div>
        <div style={{ padding: 16 }}>
          {financePlan.buckets.map((bucket) => (
            <div key={bucket.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span>{bucket.name.split(':')[0]}</span>
                <span>{bucket.tasks.length}</span>
              </div>
              <div style={{
                height: 8,
                background: '#e5e5e5',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(bucket.tasks.length / allTasks.length) * 100}%`,
                  height: '100%',
                  background: bucket.color,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState<string>("Board");

  let content: React.ReactNode;
  switch (activeTab) {
    case "Board":
      content = <BoardView />;
      break;
    case "Schedule":
      content = <ScheduleView />;
      break;
    case "Grid":
      content = <GridView />;
      break;
    case "Charts":
      content = <ChartsView />;
      break;
    default:
      content = <BoardView />;
  }

  return (
    <AppLayout>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4B38B3, #0078D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 20,
            }}>
              🗒
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
                {financePlan.name}
              </div>
              <div style={{ fontSize: 12, color: tokens.colors.neutral.textSecondary }}>
                My Plans / {financePlan.name} • Owner: {financePlan.owner}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary">Share</button>
            <button className="btn-icon">⋯</button>
          </div>
        </div>
        
        <TabStrip active={activeTab} onChange={setActiveTab} />
        
        {content}
      </div>
    </AppLayout>
  );
}

export default App;
