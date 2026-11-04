export default function Sidebar({ isOpen, currentTab, setCurrentTab }) {
  const menuItems = [
    { id: "stopwatch", label: "Stopwatch", icon: "⏱️" },
    { id: "laps", label: "Saved Laps", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h3>Workspace</h3>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`sidebar-item ${currentTab === item.id ? "active" : ""}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}