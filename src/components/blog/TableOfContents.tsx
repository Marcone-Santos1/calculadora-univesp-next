'use client';

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3")
    ).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: el.tagName === "H2" ? 2 : 3,
    }));

    setHeadings(elements);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    elements.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden xl:block sticky top-24 max-h-[80vh] overflow-auto border-l border-gray-200 dark:border-gray-800 pl-6 ml-8 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Neste artigo
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`
                block hover:text-blue-500 dark:hover:text-blue-400 transition-colors
                ${h.level === 3 && "ml-3 text-gray-500 dark:text-gray-400"}
                ${activeId === h.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-300"}
              `}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};
