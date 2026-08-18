import React, { useEffect, useMemo, useState } from 'react';

const flatten = (sections) =>
  sections.flatMap((section) => [section, ...(section.children ?? [])]);

export default function SOPSidebar({ sections = [] }) {
  const flatSections = useMemo(() => flatten(sections), [sections]);
  const [activeId, setActiveId] = useState(flatSections[0]?.id);

  useEffect(() => {
    const handleScroll = () => {
      let current = flatSections[0]?.id;

      flatSections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 120) {
          current = section.id;
        }
      });

      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [flatSections]);

  const handleClick = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderLink = (item, isChild) => {
    const isActive = item.id === activeId;

    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(event) => handleClick(event, item.id)}
        className={`flex gap-3 border-l-2 py-2 transition-colors ${
          isChild ? 'pl-7 text-[13px]' : 'pl-3 text-sm'
        } ${
          isActive
            ? 'border-sop-400 font-bold text-sop-400'
            : 'border-transparent text-sop-800 hover:text-sop-400'
        }`}
      >
        <span className="text-xs font-bold">{item.number}</span>
        <span>{item.title}</span>
      </a>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-sop-200 px-6 py-10 lg:block">
      <span className="font-bold text-sop-400 uppercase text-xs">
        Table of contents
      </span>

      <nav className="mt-5 flex flex-col gap-1">
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            {renderLink(section, false)}
            {section.children?.map((child) => renderLink(child, true))}
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
}
