'use client';

import { ReactNode, useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  el: Element;
  level: number;
}

export const TableOfContents = ({ id, children }: { id: string; children?: ReactNode }) => {
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
    <aside className="xl:block sticky top-0 xl:top-24 max-h-none xl:max-h-[80vh] overflow-visible xl:overflow-auto custom-scrollbar border-t xl:border-t-0 border-l-0 xl:border-l border-gray-200 dark:border-gray-800 pt-8 xl:pt-0 pl-0 xl:pl-6 ml-0 xl:ml-8 text-sm w-full xl:w-72 mt-8 xl:mt-0">
      <div className="hidden xl:block">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Neste artigo
        </p>
        <ul className="space-y-2 mb-8">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => scrollToElement(h.el)}
                className={`block hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer text-left ${h.level === 3 ? "ml-3 text-gray-500 dark:text-gray-400" : ""
                  } ${activeId === h.id
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-300"
                  }`}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4 xl:mt-0 border-t-0 xl:border-t xl:border-gray-200 xl:dark:border-gray-800 xl:pt-4">
        Outros artigos
      </p>

      {children}
    </aside>
  );
};
