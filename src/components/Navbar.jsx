export default function Navbar({ toggleSidebar, dark, setDark }) {
  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="heading">⏱ Stopwatch App</h1>
      </div>
      <button className="theme" onClick={() => setDark(!dark)}>
        {dark ? "☀️" : "🌙"}
      </button>
    </header>
  );
}
