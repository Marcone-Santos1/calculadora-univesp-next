'use client';

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  el: Element;
  level: number;
}

export const TableOfContents = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3, article h4")
    ).map((el, index) => {
      const level = Number(el.tagName[1]); // H2->2, H3->3, H4->4
      const id = el.id || `heading-${index}`;
      if (!el.id) el.id = id; // garante que o DOM tenha id
      return { id, text: el.textContent?.trim() || `heading-${index}`, level, el };
    });

    setHeadings(elements);
  }, []);

  // Observer para atualizar activeId
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach(h => observer.observe(h.el));

    return () => observer.disconnect();
  }, [headings]);

  // Scroll suave
  const scrollToElement = (el: Element) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(el.id);
  };


  return (
    <aside className="hidden xl:block sticky top-24 max-h-[80vh] overflow-auto border-l border-gray-200 dark:border-gray-800 pl-6 ml-8 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Neste artigo
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => scrollToElement(h.el)}
              className={`block hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer ${
                h.level === 3 ? "ml-3 text-gray-500 dark:text-gray-400" : ""
              } ${
                activeId === h.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
