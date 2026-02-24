import React from "react";
import "../index.css";


export default function Stage1_Shell({ title, subtitle, headerRight, children }) {
  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div>
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
          </div>

          {headerRight ? <div className="controls">{headerRight}</div> : null}
        </header>

        {children}

        <footer className="footer">
          Built with React components + events + state. Ready for Netlify deploy.
        </footer>
      </div>
    </div>
  );
}