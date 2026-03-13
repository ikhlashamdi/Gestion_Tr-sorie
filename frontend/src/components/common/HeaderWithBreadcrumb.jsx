import React from "react";

export default function HeaderWithBreadcrumb({ title, paths = [] }) {
  return (
    <div className="flex justify-between items-center bg-white px-6 py-4 rounded-lg shadow mb-6">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <nav className="text-sm text-gray-500">
        <ol className="flex items-center space-x-1">
          {paths.map((item, idx) => (
            <li key={idx} className="flex items-center">
              {idx !== 0 && <span className="mx-1">/</span>}
              {typeof item === "object" ? (
                <button
                  onClick={item.onClick}
                  className="bg-gray-100 px-2 py-1 rounded text-gray-700 hover:text-gray-900"
                >
                  {item.label}
                </button>
              ) : (
                <span className={idx === paths.length - 1 ? "text-gray-500" : ""}>{item}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
